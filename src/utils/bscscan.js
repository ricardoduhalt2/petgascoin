import axios from 'axios';

const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || 'YOUR_BSCSCAN_API_KEY';
const BSCSCAN_API_URL = 'https://api.bscscan.com/api';
const TESTNET_API_URL = 'https://api-testnet.bscscan.com/api';

// Get the appropriate API URL based on network
const getApiUrl = (isTestnet = false) => {
  return isTestnet ? TESTNET_API_URL : BSCSCAN_API_URL;
};

/**
 * Get token balance for a specific address
 * @param {string} address - The wallet address
 * @param {string} contractAddress - The token contract address
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<string>} The token balance in wei
 */
export const getTokenBalance = async (address, contractAddress, isTestnet = false) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: contractAddress,
        address: address,
        tag: 'latest',
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch token balance');
    }
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

/**
 * Get BNB balance for a specific address
 * @param {string} address - The wallet address
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<string>} The BNB balance in wei
 */
export const getBnbBalance = async (address, isTestnet = false) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch BNB balance');
    }
  } catch (error) {
    console.error('Error fetching BNB balance:', error);
    throw error;
  }
};

/**
 * Get token information
 * @param {string} contractAddress - The token contract address
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<Object>} Token information
 */
export const getTokenInfo = async (contractAddress, isTestnet = false) => {
  try {
    // Get token total supply
    const supplyResponse = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'stats',
        action: 'tokensupply',
        contractaddress: contractAddress,
        apikey: BSCSCAN_API_KEY,
      },
    });

    // Get token info (name, symbol, decimals)
    const infoResponse = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'token',
        action: 'tokeninfo',
        contractaddress: contractAddress,
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (supplyResponse.data.status === '1' && infoResponse.data.status === '1') {
      return {
        totalSupply: supplyResponse.data.result,
        ...infoResponse.data.result[0], // Contains name, symbol, decimals, etc.
      };
    } else {
      throw new Error('Failed to fetch token information');
    }
  } catch (error) {
    console.error('Error fetching token info:', error);
    throw error;
  }
};

/**
 * Get token transactions for a specific address
 * @param {string} address - The wallet address
 * @param {string} contractAddress - The token contract address
 * @param {number} page - Page number
 * @param {number} offset - Number of transactions per page
 * @param {string} sort - Sort order (asc/desc)
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<Array>} List of transactions
 */
export const getTokenTransactions = async (
  address,
  contractAddress,
  page = 1,
  offset = 10,
  sort = 'desc',
  isTestnet = false
) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: contractAddress,
        address: address,
        page: page,
        offset: offset,
        sort: sort,
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch transactions');
    }
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
};

/**
 * Get BNB transactions for a specific address
 * @param {string} address - The wallet address
 * @param {number} page - Page number
 * @param {number} offset - Number of transactions per page
 * @param {string} sort - Sort order (asc/desc)
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<Array>} List of transactions
 */
export const getBnbTransactions = async (
  address,
  page = 1,
  offset = 10,
  sort = 'desc',
  isTestnet = false
) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: page,
        offset: offset,
        sort: sort,
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch BNB transactions');
    }
  } catch (error) {
    console.error('Error fetching BNB transactions:', error);
    throw error;
  }
};

/**
 * Get token holders
 * @param {string} contractAddress - The token contract address
 * @param {number} page - Page number
 * @param {number} offset - Number of holders per page
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<Array>} List of token holders
 */
export const getTokenHolders = async (
  contractAddress,
  page = 1,
  offset = 10,
  isTestnet = false
) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: contractAddress,
        page: page,
        offset: offset,
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch token holders');
    }
  } catch (error) {
    console.error('Error fetching token holders:', error);
    throw error;
  }
};

/**
 * Get gas price estimates
 * @param {boolean} isTestnet - Whether to use testnet
 * @returns {Promise<Object>} Gas price estimates
 */
export const getGasPrice = async (isTestnet = false) => {
  try {
    const response = await axios.get(getApiUrl(isTestnet), {
      params: {
        module: 'gastracker',
        action: 'gasoracle',
        apikey: BSCSCAN_API_KEY,
      },
    });

    if (response.data.status === '1') {
      return response.data.result;
    } else {
      throw new Error(response.data.message || 'Failed to fetch gas price');
    }
  } catch (error) {
    console.error('Error fetching gas price:', error);
    throw error;
  }
};
