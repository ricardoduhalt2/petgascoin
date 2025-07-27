/**
 * Shortens an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @param {number} [start=6] - Number of characters to show at the start
 * @param {number} [end=4] - Number of characters to show at the end
 * @returns {string} The shortened address
 */
export const shortenAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

/**
 * Formats a number to a more readable format
 * @param {number} num - The number to format
 * @param {number} [decimals=2] - Number of decimal places to show
 * @returns {string} Formatted number as string
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === undefined || num === null) return '0';
  
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  // For very small numbers, use exponential notation
  if (Math.abs(number) < 0.000001 && number !== 0) {
    return number.toExponential(decimals);
  }
  
  // For numbers with more than 4 digits, add commas
  if (Math.abs(number) >= 1000) {
    return number.toLocaleString('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0
    });
  }
  
  // For numbers between 0.000001 and 1000
  return number.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  });
};

/**
 * Converts wei to ether
 * @param {string|BigNumber} wei - The amount in wei
 * @returns {string} The amount in ether
 */
export const weiToEther = (wei) => {
  if (!wei) return '0';
  try {
    const ethers = require('ethers');
    return ethers.utils.formatEther(wei.toString());
  } catch (error) {
    console.error('Error converting wei to ether:', error);
    return '0';
  }
};

/**
 * Converts ether to wei
 * @param {string|number} ether - The amount in ether
 * @returns {string} The amount in wei
 */
export const etherToWei = (ether) => {
  if (!ether) return '0';
  try {
    const ethers = require('ethers');
    return ethers.utils.parseEther(ether.toString()).toString();
  } catch (error) {
    console.error('Error converting ether to wei:', error);
    return '0';
  }
};

/**
 * Formats a timestamp to a readable date
 * @param {number} timestamp - The timestamp in seconds
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Copies text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise<boolean>} Whether the copy was successful
 */
export const copyToClipboard = async (text) => {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

/**
 * Checks if the current device is mobile
 * @returns {boolean} Whether the current device is mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};
