import { ethers } from 'ethers';
import { API_ENDPOINTS, CONTRACTS } from '../config';

// Format timestamp to relative time (e.g., "2 hours ago")
const formatRelativeTime = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

// Format transaction value with decimals
const formatTransactionValue = (value, decimals = 18) => {
  const formatted = ethers.utils.formatUnits(value, decimals);
  const num = parseFloat(formatted);
  return num >= 1000 ? num.toLocaleString() : num.toString();
};

// Fetch token transactions from BscScan API
const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const fetchTokenTransactions = async (address, page = 1, offset = 10) => {
  try {
    console.log('fetchTokenTransactions: Fetching token transactions for address:', address);
    await delay(500); // Add a small delay to avoid rate limits
    const response = await fetch(
      `${API_ENDPOINTS.bscScan.mainnet}?module=account&action=tokentx&contractaddress=${CONTRACTS.PGC_TOKEN}` +
      `&address=${address}&page=${page}&offset=${offset}&sort=desc` +
      `&apikey=${process.env.NEXT_PUBLIC_BSCSCAN_API_KEY}`
    );
    
    console.log('fetchTokenTransactions: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('fetchTokenTransactions: Response data:', data);
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Error fetching transactions');
    }
    
    return data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: tx.tokenSymbol,
      timeStamp: parseInt(tx.timeStamp, 10),
      isReceive: tx.to.toLowerCase() === address.toLowerCase(),
      formattedValue: formatTransactionValue(tx.value, tx.tokenDecimal),
      formattedTime: formatRelativeTime(parseInt(tx.timeStamp, 10)),
      bscScanUrl: `https://bscscan.com/tx/${tx.hash}`
    }));
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
};

// Fetch BNB transactions from BscScan API
export const fetchBnbTransactions = async (address, page = 1, offset = 10) => {
  try {
    console.log('fetchBnbTransactions: Fetching BNB transactions for address:', address);
    await delay(500); // Add a small delay to avoid rate limits
    const response = await fetch(
      `${API_ENDPOINTS.bscScan.mainnet}?module=account&action=txlist&address=${address}` +
      `&page=${page}&offset=${offset}&sort=desc&apikey=${process.env.NEXT_PUBLIC_BSCSCAN_API_KEY}`
    );
    
    console.log('fetchBnbTransactions: Response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch BNB transactions: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('fetchBnbTransactions: Response data:', data);
    
    if (data.status !== '1') {
      throw new Error(data.message || 'Error fetching BNB transactions');
    }
    
    return data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: 'BNB',
      timeStamp: parseInt(tx.timeStamp, 10),
      isReceive: tx.to.toLowerCase() === address.toLowerCase(),
      formattedValue: formatTransactionValue(tx.value, 18),
      formattedTime: formatRelativeTime(parseInt(tx.timeStamp, 10)),
      bscScanUrl: `https://bscscan.com/tx/${tx.hash}`
    }));
  } catch (error) {
    console.error('Error fetching BNB transactions:', error);
    throw error;
  }
};

// Fetch both token and BNB transactions and merge them
export const fetchAllTransactions = async (address, limit = 10) => {
  try {
    const [tokenTxs, bnbTxs] = await Promise.all([
      fetchTokenTransactions(address, 1, limit),
      fetchBnbTransactions(address, 1, limit)
    ]);
    
    // Combine and sort by timestamp (newest first)
    const allTxs = [...tokenTxs, ...bnbTxs]
      .sort((a, b) => b.timeStamp - a.timeStamp)
      .slice(0, limit);
    
    return allTxs;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};
