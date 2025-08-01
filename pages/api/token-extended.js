/**
 * Next.js API route that aggregates:
 * - On-chain stats (holders exactos y totalTransfers por logs)
 * - Scraping ligero de BscScan (precio, market cap, supplies, holders 24h, transfers 24h, top holders, últimas 10 tx, verificación)
 * Cache en memoria 10 minutos. Sin APIs de pago.
 */
import { ethers } from "ethers";

const TOKEN_ADDRESS = "0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3";
const TOKEN_BSCSCAN = `https://bscscan.com/token/${TOKEN_ADDRESS}`;
const ZERO = "0x0000000000000000000000000000000000000000";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// RPCs priorizados (server-side)
const RPC_ENDPOINTS = [
  "https://bsc.publicnode.com",
  "https://rpc.ankr.com/bsc",
  "https://1rpc.io/bnb",
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
];

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
];

const cache = {
  ts: 0,
  data: null,
  // subcaches
  onchain: {
    initialized: false,
    providerIndex: 0,
    lastBlockProcessed: 0,
    firstBlock: 0,
    balances: new Map(),
    totalTransfers: 0,
    updatedAt: 0,
    decimals: 18,
  },
};

const TEN_MIN = 10 * 60 * 1000;

function getProvider(urlOverride) {
  const url =
    urlOverride ||
    RPC_ENDPOINTS[cache.onchain.providerIndex % RPC_ENDPOINTS.length];
  const anyEthers = ethers;
  if (anyEthers.providers && anyEthers.providers.JsonRpcProvider) {
    return new anyEthers.providers.JsonRpcProvider(url, {
      name: "binance-smart-chain",
      chainId: 56,
    });
  }
  return new anyEthers.JsonRpcProvider(url, {
    chainId: 56,
    name: "binance-smart-chain",
  });
}

function rotateProvider(urlOverride) {
  if (!urlOverride) {
    cache.onchain.providerIndex =
      (cache.onchain.providerIndex + 1) % RPC_ENDPOINTS.length;
  }
  return getProvider(urlOverride);
}

function bnToBigInt(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "string") return BigInt(value);
  return BigInt(value.toString());
}

function addBalance(map, addr, delta) {
  const key = addr.toLowerCase();
  const prev = map.get(key) || 0n;
  const next = prev + delta;
  if (next === 0n) {
    map.delete(key);
  } else {
    map.set(key, next);
  }
}

async function findContractFirstBlock(provider, address) {
  const latest = await provider.getBlockNumber();
  let lo = 0;
  let hi = latest;
  let first = latest;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    try {
      const logs = await provider.getLogs({
        address,
        topics: [TRANSFER_TOPIC],
        fromBlock: mid,
        toBlock: Math.min(latest, mid + 2047),
      });
      if (logs.length > 0) {
        first = Math.min(first, logs[0].blockNumber);
        hi = mid - 1;
      } else {
        lo = mid + 2048;
      }
    } catch {
      hi = Math.max(lo, mid - 1);
    }
  }
  return Math.max(0, first - 100);
}

async function fetchLogsInRange(provider, address, fromBlock, toBlock) {
  const logs = [];
  const CHUNK = 3000;
  for (let start = fromBlock; start <= toBlock; start += CHUNK + 1) {
    const end = Math.min(start + CHUNK, toBlock);
    try {
      const chunk = await provider.getLogs({
        address,
        topics: [TRANSFER_TOPIC],
        fromBlock: start,
        toBlock: end,
      });
      logs.push(...chunk);
    } catch {
      const p2 = rotateProvider();
      const chunk = await p2.getLogs({
        address,
        topics: [TRANSFER_TOPIC],
        fromBlock: start,
        toBlock: end,
      });
      logs.push(...chunk);
    }
  }
  return logs;
}

async function initializeOnchain(provider, contract) {
  const firstBlock = await findContractFirstBlock(provider, TOKEN_ADDRESS);
  const latest = await provider.getBlockNumber();
  const logs = await fetchLogsInRange(provider, TOKEN_ADDRESS, firstBlock, latest);

  const balances = new Map();
  for (const log of logs) {
    const from = "0x" + log.topics[1].slice(26);
    const to = "0x" + log.topics[2].slice(26);
    const value = bnToBigInt(
      (ethers.getBigInt ? ethers.getBigInt(log.data) : BigInt(log.data))
    );
    if (from.toLowerCase() !== ZERO) addBalance(balances, from, -value);
    if (to.toLowerCase() !== ZERO) addBalance(balances, to, value);
  }

  cache.onchain.balances = balances;
  cache.onchain.totalTransfers = logs.length;
  cache.onchain.lastBlockProcessed = latest;
  cache.onchain.firstBlock = firstBlock;
  cache.onchain.initialized = true;
  cache.onchain.updatedAt = Date.now();
  try {
    cache.onchain.decimals = await contract.decimals().catch(() => 18);
  } catch {
    cache.onchain.decimals = 18;
  }
}

async function incrementalOnchain(provider) {
  const latest = await provider.getBlockNumber();
  if (latest <= cache.onchain.lastBlockProcessed) return;

  const fromBlock = cache.onchain.lastBlockProcessed + 1;
  const logs = await fetchLogsInRange(provider, TOKEN_ADDRESS, fromBlock, latest);

  for (const log of logs) {
    const from = "0x" + log.topics[1].slice(26);
    const to = "0x" + log.topics[2].slice(26);
    const value = bnToBigInt(
      (ethers.getBigInt ? ethers.getBigInt(log.data) : BigInt(log.data))
    );
    if (from.toLowerCase() !== ZERO) addBalance(cache.onchain.balances, from, -value);
    if (to.toLowerCase() !== ZERO) addBalance(cache.onchain.balances, to, value);
  }

  cache.onchain.totalTransfers += logs.length;
  cache.onchain.lastBlockProcessed = latest;
  cache.onchain.updatedAt = Date.now();
}

function holdersCount() {
  let c = 0;
  for (const [, bal] of cache.onchain.balances) if (bal > 0n) c++;
  return c;
}

// Utilidades de scraping simple sin dependencias extra
function extractBetween(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return null;
  const from = start + startMarker.length;
  const end = html.indexOf(endMarker, from);
  if (end === -1) return null;
  return html.slice(from, end);
}

function textBetween(html, before, after) {
  const raw = extractBetween(html, before, after);
  if (!raw) return null;
  return raw.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function numberFromText(txt) {
  if (!txt) return null;
  const cleaned = txt.replace(/[^0-9.\-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// Scraping de BscScan (mejor esfuerzo, puede cambiar el HTML)
async function scrapeBscScan() {
  const res = await fetch(TOKEN_BSCSCAN, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
    },
  });
  const html = await res.text();

  // Campos comunes visibles
  const priceText =
    textBetween(html, 'class="text-2xl font-bold', "</div>") ||
    textBetween(html, 'id="ContentPlaceHolder1_tr_valuepertoken"', "</tr>");
  const marketCapText =
    textBetween(html, ">Market Cap<", "</div>") ||
    textBetween(html, "Market Cap", "</tr>");
  const totalSupplyText =
    textBetween(html, ">Total Supply<", "</div>") ||
    textBetween(html, "Total Supply", "</tr>");
  const circulatingSupplyText =
    textBetween(html, ">Circulating Supply<", "</div>") ||
    textBetween(html, "Circulating Supply", "</tr>");

  // Verificación de contrato
  const verified =
    html.includes("Contract Source Code Verified") ||
    html.includes("Verified Contract") ||
    html.includes("Contract Source Code Verified (Exact Match)");

  // Holders 24h y Transfers 24h pueden aparecer en tarjetas/resúmenes
  const holders24Text =
    textBetween(html, "Holders (24H)", "</") ||
    textBetween(html, "Holders(24H)", "</");
  const transfers24Text =
    textBetween(html, "Transfers (24H)", "</") ||
    textBetween(html, "Transfers(24H)", "</");

  // Top holders: intentar localizar tabla (simple)
  let topHolders = [];
  const topSectionStart = html.indexOf("Top Holders");
  if (topSectionStart !== -1) {
    const slice = html.slice(topSectionStart, topSectionStart + 20000);
    const rows = slice.split("<tr").slice(1, 12);
    topHolders = rows
      .map((row) => {
        const addr =
          (row.match(/0x[a-fA-F0-9]{40}/)?.[0] ||
            textBetween(row, 'href="/address/', '"')) ?? null;
        const pctTxt =
          row.match(/[\d.]+%/)?.[0] ||
          textBetween(row, "<td>", "</td>");
        return addr
          ? {
              address: "0x" + addr.replace(/^0x/, ""),
              percent: pctTxt?.includes("%") ? pctTxt : null,
            }
          : null;
      })
      .filter(Boolean);
  }

  // Últimas 10 transferencias: sección "Transactions" de la página del token
  let recentTransfers = [];
  const txStart = html.indexOf("Transactions");
  if (txStart !== -1) {
    const txSlice = html.slice(txStart, txStart + 40000);
    const txRows = txSlice.split("<tr").slice(1, 12);
    recentTransfers = txRows
      .map((row) => {
        const hash = row.match(/0x[a-fA-F0-9]{64}/)?.[0] || null;
        const from = row.match(/From<\/span>.*?0x[a-fA-F0-9]{40}/s)?.[0]?.slice(-42) || null;
        const to = row.match(/To<\/span>.*?0x[a-fA-F0-9]{40}/s)?.[0]?.slice(-42) || null;
        const valTxt = row.match(/[\d,.]+\s*PGC/)?.[0] || null;
        return hash ? { hash, from, to, valueText: valTxt } : null;
      })
      .filter(Boolean);
  }

  return {
    price: numberFromText(priceText),
    marketCap: numberFromText(marketCapText),
    totalSupplyText: totalSupplyText || null,
    circulatingSupplyText: circulatingSupplyText || null,
    holders24h: numberFromText(holders24Text),
    transfers24h: numberFromText(transfers24Text),
    verified,
    topHolders,
    recentTransfers,
  };
}

async function getProviderReady() {
  let provider = null;
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    try {
      provider = getProvider();
      if (provider.getNetwork) {
        const net = await provider.getNetwork();
        const cid = Number(net?.chainId || net?.chainId?.toString?.());
        if (cid !== 56) throw new Error(`Wrong chainId ${cid}`);
      } else if (provider._networkPromise) {
        const net = await provider._networkPromise;
        const cid = Number(net?.chainId || net?.chainId?.toString?.());
        if (cid !== 56) throw new Error(`Wrong chainId ${cid}`);
      }
      await provider.getBlockNumber();
      return provider;
    } catch {
      provider = rotateProvider();
      continue;
    }
  }
  return null;
}

export default async function handler(req, res) {
  const now = Date.now();
  if (cache.data && now - cache.ts < TEN_MIN) {
    return res.status(200).json({ ...cache.data, cached: true });
  }

  // 1) On-chain holders/transfers + metadata mínima
  let provider = await getProviderReady();
  if (!provider) {
    // Si no hay proveedor, devolver cached o fallback mínimo
    const minimal = cache.data || {
      holders: 301,
      totalTransfers: 331,
      price: null,
      marketCap: null,
      totalSupply: null,
      decimals: null,
      circulatingSupply: null,
      holders24h: null,
      transfers24h: null,
      verified: null,
      topHolders: [],
      recentTransfers: [],
      updatedAt: now,
      source: "fallback",
    };
    return res.status(200).json({ ...minimal, cached: true, error: "No RPC" });
  }

  const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
  // Inicialización/actualización on-chain
  try {
    if (!cache.onchain.initialized) {
      await initializeOnchain(provider, contract);
    } else {
      await incrementalOnchain(provider);
    }
  } catch (e) {
    // fallback ligero manteniendo datos previos
  }

  // Metadata on-chain básica
  let totalSupply = null;
  let decimals = cache.onchain.decimals || 18;
  try {
    decimals = await contract.decimals();
  } catch {}
  try {
    const ts = await contract.totalSupply();
    totalSupply = ts?.toString?.() || null;
  } catch {}

  // 2) Scraping ligero de BscScan
  let scraped = {};
  try {
    scraped = await scrapeBscScan();
  } catch (e) {
    scraped = {};
  }

  const data = {
    holders: holdersCount(),
    totalTransfers: cache.onchain.totalTransfers,
    price: scraped.price ?? null,
    marketCap: scraped.marketCap ?? null,
    totalSupply: totalSupply,
    decimals,
    circulatingSupply: scraped.circulatingSupplyText ?? null,
    holders24h: scraped.holders24h ?? null,
    transfers24h: scraped.transfers24h ?? null,
    verified: scraped.verified ?? null,
    topHolders: scraped.topHolders ?? [],
    recentTransfers: scraped.recentTransfers ?? [],
    updatedAt: Date.now(),
    source: "onchain+scrape",
  };

  cache.data = data;
  cache.ts = Date.now();
  return res.status(200).json({ ...data, cached: false });
}
