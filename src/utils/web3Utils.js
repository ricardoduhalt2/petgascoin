import { ethers } from 'ethers';

/**
 * Converts a value from Wei to Ether.
 * @param {string | ethers.BigNumber} wei - The value in Wei.
 * @returns {string} The value in Ether.
 */
export const formatWeiToEther = (wei) => {
  if (!wei) return '0';
  return ethers.utils.formatEther(wei);
};

/**
 * Converts a value from Ether to Wei.
 * @param {string | number} ether - The value in Ether.
 * @returns {ethers.BigNumber} The value in Wei.
 */
export const parseEtherToWei = (ether) => {
  if (!ether) return ethers.BigNumber.from(0);
  return ethers.utils.parseEther(ether);
};

/**
 * Returns an ethers.js Contract instance.
 * @param {ethers.Signer | ethers.Provider} signerOrProvider - The signer or provider.
 * @param {string} address - The contract address.
 * @param {Array<any>} abi - The contract ABI.
 * @returns {ethers.Contract} The contract instance.
 */
export const getContractInstance = (signerOrProvider, address, abi) => {
  return new ethers.Contract(address, abi, signerOrProvider);
};

/**
 * Checks if a given string is a valid hexadecimal string.
 * @param {string} hex - The string to check.
 * @returns {boolean} True if it's a valid hex string, false otherwise.
 */
export const isHexString = (hex) => {
  return ethers.utils.isHexString(hex);
};
