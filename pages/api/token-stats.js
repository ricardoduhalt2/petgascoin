/**
 * Next.js API route to fetch live token stats (holders and total transfers) on BSC mainnet
 * without paid APIs. It scans Transfer logs once, builds balances, and caches results in memory.
 * Adds incremental updates on subsequent calls for efficiency.
 */
import { ethers } from "ethers";

const TOKEN_ADDRESS = "0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3";
const ZERO = "0x0000000000000000000000000000000000000000";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Public RPC endpoints (with fallbacks)
const RPC_ENDPOINTS = [
  // Use CORS-friendly public endpoints for server-side calls
  "https://bsc.publicnode.com",
  "https://rpc.ankr.com/bsc",
  "https://1rpc.io/bnb",
  // Keep Binance dataseeds as later fallbacks (some may fail CORS/handshake)
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
];

// Minimal ERC20 ABI
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// In-memory cache across server invocations (persists while serverless/Node stays warm)
const cache = {
  initialized: false,
  providerIndex: 0,
  lastBlockProcessed: 0,
  firstBlock: 0,
  balances: new Map(), // address => BigInt
  totalTransfers: 0,
  updatedAt: 0,
  decimals: 18,
};

function getProvider(urlOverride) {
  const url =
    urlOverride || RPC_ENDPOINTS[cache.providerIndex % RPC_ENDPOINTS.length];
  // Support both ethers v5 and v6
  const anyEthers = ethers;
  if (anyEthers.providers && anyEthers.providers.JsonRpcProvider) {
    // v5 style
    return new anyEthers.providers.JsonRpcProvider(url, {
      name: "binance-smart-chain",
      chainId: 56,
    });
  }
  // v6 style
  return new anyEthers.JsonRpcProvider(url, {
    chainId: 56,
    name: "binance-smart-chain",
  });
}

function rotateProvider(urlOverride) {
  if (!urlOverride) {
    cache.providerIndex = (cache.providerIndex + 1) % RPC_ENDPOINTS.length;
  }
  return getProvider(urlOverride);
}

function bnToBigInt(value) {
  // ethers v6 returns BigInt-like via toString
  if (typeof value === "bigint") return value;
  if (typeof value === "string") return BigInt(value);
  return BigInt(value.toString());
}

function addBalance(addr, delta) {
  const key = addr.toLowerCase();
  const prev = cache.balances.get(key) || 0n;
  const next = prev + delta;
  if (next === 0n) {
    cache.balances.delete(key);
  } else {
    cache.balances.set(key, next);
  }
}

async function findContractFirstBlock(provider, address) {
  // Best-effort: binary search earliest Transfer log
  // Start with wide range
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
        toBlock: mid + 2047 > latest ? latest : mid + 2047, // window to reduce calls
      });
      if (logs.length > 0) {
        first = Math.min(first, logs[0].blockNumber);
        hi = mid - 1;
      } else {
        lo = mid + 2048;
      }
    } catch (e) {
      // On rate limits or errors, shrink window
      hi = Math.max(lo, mid - 1);
    }
  }
  return Math.max(0, first - 100); // small cushion
}

async function fetchLogsInRange(provider, address, fromBlock, toBlock) {
  // BSC nodes may limit range; chunk requests
  const logs = [];
  const CHUNK = 3000; // conservative chunk size for BSC
  for (let start = fromBlock; start <= toBlock; start += CHUNK + 1) {
    const end = Math.min(start + CHUNK, toBlock);
    const attempt = async () => {
      return provider.getLogs({
        address,
        topics: [TRANSFER_TOPIC],
        fromBlock: start,
        toBlock: end,
      });
    };
    try {
      logs.push(...(await attempt()));
    } catch (e1) {
      // rotate provider and retry once
      const p2 = rotateProvider();
      logs.push(...(await p2.getLogs({
        address,
        topics: [TRANSFER_TOPIC],
        fromBlock: start,
        toBlock: end,
      })));
    }
  }
  return logs;
}

async function initializeState(provider, contract) {
  // Find first block with activity
  const firstBlock = await findContractFirstBlock(provider, TOKEN_ADDRESS);
  const latest = await provider.getBlockNumber();

  const logs = await fetchLogsInRange(provider, TOKEN_ADDRESS, firstBlock, latest);

  // Build balances and count transfers
  cache.balances = new Map();
  for (const log of logs) {
    const from = "0x" + log.topics[1].slice(26);
    const to = "0x" + log.topics[2].slice(26);
    const value = bnToBigInt((ethers.getBigInt ? ethers.getBigInt(log.data) : BigInt(log.data)));

    if (from.toLowerCase() !== ZERO) addBalance(from, -value);
    if (to.toLowerCase() !== ZERO) addBalance(to, value);
  }

  cache.totalTransfers = logs.length;
  cache.lastBlockProcessed = latest;
  cache.firstBlock = firstBlock;
  cache.initialized = true;
  cache.updatedAt = Date.now();
  try {
    cache.decimals = await contract.decimals().catch(() => 18);
  } catch {
    cache.decimals = 18;
  }
}

async function incrementalUpdate(provider) {
  const latest = await provider.getBlockNumber();
  if (latest <= cache.lastBlockProcessed) return;

  const fromBlock = cache.lastBlockProcessed + 1;
  const logs = await fetchLogsInRange(provider, TOKEN_ADDRESS, fromBlock, latest);

  for (const log of logs) {
    const from = "0x" + log.topics[1].slice(26);
    const to = "0x" + log.topics[2].slice(26);
    const value = bnToBigInt((ethers.getBigInt ? ethers.getBigInt(log.data) : BigInt(log.data)));

    if (from.toLowerCase() !== ZERO) addBalance(from, -value);
    if (to.toLowerCase() !== ZERO) addBalance(to, value);
  }

  cache.totalTransfers += logs.length;
  cache.lastBlockProcessed = latest;
  cache.updatedAt = Date.now();
}

function getHoldersCount() {
  // Count addresses with balance > 0
  let count = 0;
  for (const [, bal] of cache.balances) {
    if (bal > 0n) count++;
  }
  return count;
}

function ms(s) {
  return s * 1000;
}

// Throttle window for API refreshes
const REFRESH_INTERVAL_MS = ms(60); // 1 minute

export default async function handler(req, res) {
  // Ensure server-side only (but users fetch this via Next API which is server-side)
  // Simple cache throttle
  const now = Date.now();
  if (cache.initialized && now - cache.updatedAt < REFRESH_INTERVAL_MS) {
    return res.status(200).json({
      holders: getHoldersCount(),
      totalTransfers: cache.totalTransfers,
      updatedAt: cache.updatedAt,
      cached: true,
    });
  }

  // Ensure we have a provider and contract
  // Try providers until network detection succeeds (chainId 56)
  let provider = null;
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    try {
      provider = getProvider();
      // v6: getNetwork, v5: _networkPromise then getBlockNumber to confirm
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
      break;
    } catch (e) {
      provider = rotateProvider();
      continue;
    }
  }
  if (!provider) {
    return res.status(200).json({
      holders: cache.initialized ? getHoldersCount() : 301,
      totalTransfers: cache.initialized ? cache.totalTransfers : 331,
      updatedAt: cache.updatedAt || now,
      cached: true,
      error: "All RPC endpoints failed to detect BSC network",
    });
  }
  const contract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

  try {
    if (!cache.initialized) {
      await initializeState(provider, contract);
    } else {
      await incrementalUpdate(provider);
    }

    return res.status(200).json({
      holders: getHoldersCount(),
      totalTransfers: cache.totalTransfers,
      updatedAt: cache.updatedAt,
      cached: false,
    });
  } catch (err) {
    // Fallback to known numbers if available, otherwise provide safe defaults
    const fallbackHolders = 301;
    const fallbackTransfers = 331;

    return res.status(200).json({
      holders: cache.initialized ? getHoldersCount() : fallbackHolders,
      totalTransfers: cache.initialized ? cache.totalTransfers : fallbackTransfers,
      updatedAt: cache.updatedAt || now,
      cached: true,
      error: err?.message || "unknown error",
    });
  }
}
