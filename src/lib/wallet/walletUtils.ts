/**
 * Wallet connection utilities
 * Handles Ethereum wallet connection via window.ethereum (MetaMask, etc.)
 */

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

/**
 * Check if wallet is available
 */
export function isWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.ethereum !== 'undefined';
}

/**
 * Get current wallet address if connected
 */
export async function getWalletAddress(): Promise<string | null> {
  if (!isWalletAvailable() || !window.ethereum) return null;

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
}

/**
 * Connect to wallet
 */
export async function connectWallet(): Promise<string | null> {
  if (!isWalletAvailable() || !window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('Wallet connection rejected by user.');
    }
    throw new Error(error.message || 'Failed to connect wallet');
  }
}

/**
 * Disconnect wallet (just clears local state, doesn't disconnect from wallet)
 */
export function disconnectWallet(): void {
  // Wallet disconnection is handled by the wallet provider
  // We just clear our local state
}

/**
 * Get chain ID
 */
export async function getChainId(): Promise<number | null> {
  if (!isWalletAvailable() || !window.ethereum) return null;

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId ? parseInt(chainId, 16) : null;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Listen for wallet account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isWalletAvailable() || !window.ethereum) return () => {};

  const handler = (accounts: string[]) => {
    callback(accounts);
  };

  window.ethereum.on('accountsChanged', handler);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handler);
    }
  };
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isWalletAvailable() || !window.ethereum) return () => {};

  const handler = (chainId: string) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handler);

  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', handler);
    }
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

