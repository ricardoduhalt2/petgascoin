import { useEffect, useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { formatNumber } from '../utils/helpers';
import { ethers } from 'ethers';

function StatSkeleton() {
  return (
    <div className="relative overflow-hidden text-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
      <div className="animate-pulse h-6 w-16 mx-auto rounded bg-gray-300 mb-2"></div>
      <div className="h-3 w-20 mx-auto rounded bg-gray-200"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-[spin_2s_linear_infinite] absolute -top-6 -left-6 h-12 w-12 rounded-full border-2 border-transparent border-t-yellow-400 border-r-yellow-500"></div>
        <div className="animate-[spin_3s_linear_infinite] absolute -bottom-6 -right-6 h-16 w-16 rounded-full border-2 border-transparent border-t-orange-400 border-l-orange-500"></div>
      </div>
    </div>
  );
}

export default function TokenInfoCard({ account, isConnected, isWrongNetwork }) {
  const [tokenData, setTokenData] = useState({
    name: 'PetgasCoin',
    symbol: 'PGC',
    totalSupply: '1000000000',
    circulatingSupply: '600000000',
    price: '0.00',
    marketCap: '0',
    holders: '0'
  });
  const [userBalance, setUserBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  // Live stats state from on-chain API
  const [liveStats, setLiveStats] = useState({
    holders: null,
    totalTransfers: null,
    updatedAt: null,
    loading: true,
    error: null,
  });

  // Extended stats from /api/token-extended
  const [extended, setExtended] = useState({
    price: null,
    marketCap: null,
    totalSupply: null,
    circulatingSupply: null,
    decimals: null,
    holders24h: null,
    transfers24h: null,
    verified: null,
    topHolders: [],
    recentTransfers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    async function fetchStats() {
      try {
        setLiveStats((s) => ({ ...s, loading: true }));
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${origin}/api/token-stats`);
        const data = await res.json();
        if (!active) return;
        setLiveStats({
          holders: data?.holders ?? 301,
          totalTransfers: data?.totalTransfers ?? 331,
          updatedAt: data?.updatedAt ?? Date.now(),
          loading: false,
          error: null,
        });
        // Update holders into tokenData for display
        setTokenData((td) => ({
          ...td,
          holders: String(data?.holders ?? 301),
        }));
      } catch (e) {
        if (!active) return;
        setLiveStats({
          holders: 301,
          totalTransfers: 331,
          updatedAt: Date.now(),
          loading: false,
          error: e?.message || 'failed',
        });
        setTokenData((td) => ({
          ...td,
          holders: '301',
        }));
      }
    }
    fetchStats();
    const id = setInterval(fetchStats, 60_000);

    // fetch extended data (onchain + BscScan scrape) every 10 min
    async function fetchExtended() {
      try {
        setExtended((s) => ({ ...s, loading: true }));
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${origin}/api/token-extended`);
        const data = await res.json();
        setExtended({
          price: data?.price ?? null,
          marketCap: data?.marketCap ?? null,
          totalSupply: data?.totalSupply ?? null,
          circulatingSupply: data?.circulatingSupply ?? null,
          decimals: data?.decimals ?? null,
          holders24h: data?.holders24h ?? null,
          transfers24h: data?.transfers24h ?? null,
          verified: data?.verified ?? null,
          topHolders: Array.isArray(data?.topHolders) ? data.topHolders : [],
          recentTransfers: Array.isArray(data?.recentTransfers) ? data.recentTransfers : [],
          loading: false,
          error: null,
        });
        // sync visible fields
        setTokenData((td) => ({
          ...td,
          price: data?.price != null ? String(data.price) : td.price,
          marketCap: data?.marketCap != null ? String(data.marketCap) : td.marketCap,
          totalSupply: data?.totalSupply ?? td.totalSupply,
        }));
      } catch (e) {
        setExtended((s) => ({ ...s, loading: false, error: e?.message || 'failed' }));
      }
    }
    fetchExtended();
    const id2 = setInterval(fetchExtended, 10 * 60_000);

    return () => {
      active = false;
      clearInterval(id);
      clearInterval(id2);
    };
  }, []);

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (!num) return '0';
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
  };

  // UI helpers
  const shimmer = "relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent";
  const StatChip = ({ label, value, loading, color = "bg-gray-50", spin=false }) => (
    <div className={`relative group text-center p-4 ${color} rounded-lg border border-gray-200 overflow-hidden`}>
      <div className="text-lg font-semibold text-gray-900">
        {loading ? <div className={`h-6 w-20 mx-auto rounded bg-gray-200 ${shimmer}`}></div> : value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
      {spin && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="animate-[spin_2.5s_linear_infinite] h-10 w-10 rounded-full border-2 border-transparent border-t-yellow-400 border-r-orange-400" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="animate-[spin_6s_linear_infinite] absolute -bottom-8 -left-8 h-16 w-16 rounded-full border-2 border-transparent border-b-yellow-300" />
      </div>
    </div>
  );

  const formatK = (n) => {
    if (n == null) return '—';
    const num = Number(n);
    if (!isFinite(num)) return '—';
    if (num >= 1e9) return (num/1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num/1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num/1e3).toFixed(2) + 'K';
    return num.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {/* Token logo from BscScan (fallback to local circle) */}
          <div className="w-12 h-12 mr-4 rounded-full border border-yellow-300 flex items-center justify-center overflow-hidden bg-gradient-to-r from-yellow-100 to-yellow-200">
            <img
              src="https://bscscan.com/token/images/petgas_32.png?v=2"
              alt="PGC"
              className="w-10 h-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                // keep gradient circle with letters as fallback
              }}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tokenData.name || 'PetgasCoin'}</h2>
            <p className="text-gray-600">{tokenData.symbol || 'PGC'}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {extended.price != null ? `$${Number(extended.price).toFixed(6)}` : `$${tokenData.price || '0.00'}`}
          </div>
          <div className="text-sm text-gray-500">
            Market Cap: {extended.marketCap != null ? `$${formatK(extended.marketCap)}` : `$${formatLargeNumber(tokenData.marketCap)}`}
          </div>
        </div>
      </div>

      {/* Token Statistics */}
      {/* Top stats with animations */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatChip
          label="Price"
          value={extended.price != null ? `$${Number(extended.price).toFixed(6)}` : '—'}
          loading={extended.loading}
          color="bg-gradient-to-br from-gray-50 to-gray-100"
        />
        <StatChip
          label="Market Cap"
          value={extended.marketCap != null ? `$${formatK(extended.marketCap)}` : '—'}
          loading={extended.loading}
          color="bg-gradient-to-br from-gray-50 to-gray-100"
        />
        <StatChip
          label="Total Supply"
          value={
            extended.totalSupply != null
              ? formatK(extended.totalSupply)
              : formatLargeNumber(tokenData.totalSupply)
          }
          loading={extended.loading}
          color="bg-gray-50"
        />
        <StatChip
          label="Circulating"
          value={extended.circulatingSupply != null ? String(extended.circulatingSupply) : '—'}
          loading={extended.loading}
          color="bg-gray-50"
        />
      </div>

      {/* Live on-chain chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatChip
          label="Holders"
          value={formatK(liveStats.holders || tokenData.holders)}
          loading={liveStats.loading}
          color="bg-white"
          spin
        />
        <StatChip
          label="Total Transfers"
          value={formatK(liveStats.totalTransfers)}
          loading={liveStats.loading}
          color="bg-white"
        />
        <StatChip
          label="Holders 24h"
          value={extended.holders24h != null ? formatK(extended.holders24h) : '—'}
          loading={extended.loading}
          color="bg-white"
        />
        <StatChip
          label="Transfers 24h"
          value={extended.transfers24h != null ? formatK(extended.transfers24h) : '—'}
          loading={extended.loading}
          color="bg-white"
        />
      </div>

      {/* Verification badge + link to BscScan */}
      <div className="mb-6 flex items-center gap-3">
        <a
          href={`https://bscscan.com/token/0x46617e7bca14de818d9E5cFf2aa106b72CB33fe3`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 underline"
        >
          View on BscScan
        </a>
        <div className="inline-flex items-center px-3 py-1 rounded-full border"
             style={{ borderColor: extended.verified ? '#16a34a' : '#d1d5db' }}>
          <span className={`w-2 h-2 rounded-full mr-2 ${extended.verified ? 'bg-green-500 animate-ping' : 'bg-gray-300'}`} />
          <span className={`text-sm ${extended.verified ? 'text-green-700' : 'text-gray-600'}`}>
            {extended.verified ? 'Contract Verified' : 'Contract Not Verified'}
          </span>
        </div>
      </div>

      {/* Top Holders list with bars */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Holders</h3>
        <div className="space-y-2">
          {extended.loading && (
            <>
              <div className={`h-6 rounded bg-gray-100 ${shimmer}`} />
              <div className={`h-6 rounded bg-gray-100 ${shimmer}`} />
              <div className={`h-6 rounded bg-gray-100 ${shimmer}`} />
            </>
          )}
          {!extended.loading && extended.topHolders?.slice(0,10).map((h, idx) => {
            const pct = h?.percent ? parseFloat(h.percent) : null;
            return (
              <div key={idx} className="relative p-2 rounded border border-gray-200 overflow-hidden">
                <div className="text-xs text-gray-600 mb-1 truncate">{h.address}</div>
                <div className="h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded"
                    style={{ width: pct ? `${Math.min(100, pct)}%` : '10%' }}
                  />
                </div>
                <div className="absolute top-2 right-2 text-xs text-gray-700">{h.percent || '—'}</div>
              </div>
            );
          })}
          {!extended.loading && (!extended.topHolders || extended.topHolders.length === 0) && (
            <div className="text-sm text-gray-500">No data</div>
          )}
        </div>
      </div>

      {/* Recent Transfers table */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transfers</h3>
          <button
            onClick={() => {
              // manual refresh of extended endpoint
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              fetch(`${origin}/api/token-extended`).then(r => r.json()).then((data) => {
                setExtended((s) => ({
                  ...s,
                  price: data?.price ?? s.price,
                  marketCap: data?.marketCap ?? s.marketCap,
                  totalSupply: data?.totalSupply ?? s.totalSupply,
                  circulatingSupply: data?.circulatingSupply ?? s.circulatingSupply,
                  holders24h: data?.holders24h ?? s.holders24h,
                  transfers24h: data?.transfers24h ?? s.transfers24h,
                  verified: data?.verified ?? s.verified,
                  topHolders: Array.isArray(data?.topHolders) ? data.topHolders : s.topHolders,
                  recentTransfers: Array.isArray(data?.recentTransfers) ? data.recentTransfers : s.recentTransfers,
                  loading: false,
                  error: null,
                }));
              }).catch(() => {});
            }}
            className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 transition"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {extended.loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="bg-white">
                  <td className="px-3 py-2"><div className={`h-4 w-40 rounded bg-gray-100 ${shimmer}`} /></td>
                  <td className="px-3 py-2"><div className={`h-4 w-40 rounded bg-gray-100 ${shimmer}`} /></td>
                  <td className="px-3 py-2"><div className={`h-4 w-40 rounded bg-gray-100 ${shimmer}`} /></td>
                  <td className="px-3 py-2"><div className={`h-4 w-20 rounded bg-gray-100 ${shimmer}`} /></td>
                </tr>
              ))}
              {!extended.loading && extended.recentTransfers?.slice(0,10).map((tx, i) => (
                <tr key={tx.hash + i} className="bg-white hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-xs text-blue-600 truncate">{tx.hash}</td>
                  <td className="px-3 py-2 text-xs truncate">{tx.from || '—'}</td>
                  <td className="px-3 py-2 text-xs truncate">{tx.to || '—'}</td>
                  <td className="px-3 py-2 text-xs">{tx.valueText || '—'}</td>
                </tr>
              ))}
              {!extended.loading && (!extended.recentTransfers || extended.recentTransfers.length === 0) && (
                <tr><td className="px-3 py-4 text-sm text-gray-500" colSpan={4}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Balance Section */}
      {isConnected && account && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your PGC Balance</h3>
              <p className="text-gray-600">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                ) : (
                  `${userBalance} PGC`
                )}
              </div>
              {!isWrongNetwork && (
                <div className="text-sm text-gray-500">
                  ≈ ${(parseFloat(userBalance) * parseFloat(tokenData.price)).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Network Warning */}
      {isWrongNetwork && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 text-sm">
              Please switch to Binance Smart Chain to view your PGC balance
            </span>
          </div>
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 mb-2">Connect your wallet to view your PGC balance</p>
          <p className="text-blue-600 text-sm">
            Make sure you're connected to Binance Smart Chain
          </p>
        </div>
      )}
    </div>
  );
}
