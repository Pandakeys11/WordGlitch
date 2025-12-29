import { getCurrentProfileId } from '@/lib/storage/gameStorage';
import { STORAGE_KEYS } from '@/lib/constants';

const CURRENCY_RATIO = 20; // 20 total score = 1 currency
const STORAGE_KEY = 'word-glitch-currency';

interface CurrencyData {
  currency: number;
  totalEarned: number;
  transactions: CurrencyTransaction[];
}

interface CurrencyTransaction {
  id: string;
  type: 'earned' | 'spent' | 'converted';
  amount: number;
  timestamp: number;
  description: string;
}

function getCurrencyKey(profileId: string): string {
  return `${STORAGE_KEY}-${profileId}`;
}

function loadCurrencyData(profileId: string): CurrencyData {
  try {
    const data = localStorage.getItem(getCurrencyKey(profileId));
    if (!data) {
      return {
        currency: 0,
        totalEarned: 0,
        transactions: [],
      };
    }
    return JSON.parse(data) as CurrencyData;
  } catch {
    return {
      currency: 0,
      totalEarned: 0,
      transactions: [],
    };
  }
}

function saveCurrencyData(profileId: string, data: CurrencyData): void {
  localStorage.setItem(getCurrencyKey(profileId), JSON.stringify(data));
}

/**
 * Convert total score to currency
 * @param totalScore - Total score from profile
 * @returns Currency amount (totalScore / 20)
 */
export function convertTotalScoreToCurrency(totalScore: number): number {
  if (!Number.isFinite(totalScore) || totalScore < 0) {
    return 0;
  }
  return Math.floor(totalScore / CURRENCY_RATIO);
}

/**
 * Convert gameplay points to currency (legacy function, kept for backward compatibility)
 * @param points - Points earned from gameplay
 * @returns Currency amount (points / 20)
 * @deprecated Use convertTotalScoreToCurrency instead
 */
export function convertPointsToCurrency(points: number): number {
  return convertTotalScoreToCurrency(points);
}

/**
 * Award currency from gameplay points
 * @param points - Points earned from gameplay
 * @param description - Optional description for transaction
 * @returns Amount of currency awarded
 */
export function awardCurrency(points: number, description?: string): number {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    console.warn('Cannot award currency: No active profile');
    return 0;
  }

  // Validate points input
  if (!Number.isFinite(points) || points < 0) {
    console.warn('Invalid points value:', points);
    return 0;
  }

  const currencyAmount = convertPointsToCurrency(points);
  if (currencyAmount <= 0) return 0;

  try {
    const data = loadCurrencyData(profileId);
    data.currency += currencyAmount;
    data.totalEarned += currencyAmount;

    // Validate currency values
    if (!Number.isFinite(data.currency) || data.currency < 0) {
      console.error('Invalid currency value, resetting');
      data.currency = currencyAmount;
    }
    if (!Number.isFinite(data.totalEarned) || data.totalEarned < 0) {
      data.totalEarned = currencyAmount;
    }

    data.transactions.push({
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'earned',
      amount: currencyAmount,
      timestamp: Date.now(),
      description: description || `Earned from gameplay (${points} points)`,
    });

    // Keep only last 100 transactions
    if (data.transactions.length > 100) {
      data.transactions = data.transactions.slice(-100);
    }

    saveCurrencyData(profileId, data);
    return currencyAmount;
  } catch (error) {
    console.error('Error awarding currency:', error);
    return 0;
  }
}

/**
 * Get current currency balance
 * @returns Current currency balance
 */
export function getCurrencyBalance(): number {
  const profileId = getCurrentProfileId();
  if (!profileId) return 0;

  const data = loadCurrencyData(profileId);
  return data.currency;
}

/**
 * Spend currency
 * @param amount - Amount to spend
 * @param description - Description of purchase
 * @returns True if successful, false if insufficient funds
 */
export function spendCurrency(amount: number, description: string): boolean {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    console.warn('Cannot spend currency: No active profile');
    return false;
  }

  // Validate amount input
  if (!Number.isFinite(amount) || amount <= 0) {
    console.warn('Invalid amount:', amount);
    return false;
  }

  try {
    const data = loadCurrencyData(profileId);
    
    // Validate currency balance
    if (!Number.isFinite(data.currency) || data.currency < 0) {
      console.error('Invalid currency balance, resetting');
      data.currency = 0;
    }

    if (data.currency < amount) {
      return false;
    }

    data.currency -= amount;
    
    // Ensure currency doesn't go negative
    if (data.currency < 0) {
      data.currency = 0;
    }

    data.transactions.push({
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'spent',
      amount: -amount,
      timestamp: Date.now(),
      description,
    });

    // Keep only last 100 transactions
    if (data.transactions.length > 100) {
      data.transactions = data.transactions.slice(-100);
    }

    saveCurrencyData(profileId, data);
    return true;
  } catch (error) {
    console.error('Error spending currency:', error);
    return false;
  }
}

/**
 * Get currency statistics
 * @returns Currency statistics
 */
export function getCurrencyStats(): {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  recentTransactions: CurrencyTransaction[];
} {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    return {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      recentTransactions: [],
    };
  }

  const data = loadCurrencyData(profileId);
  const totalSpent = data.transactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    balance: data.currency,
    totalEarned: data.totalEarned,
    totalSpent,
    recentTransactions: data.transactions.slice(-10).reverse(),
  };
}

/**
 * Sync currency with total score from profile
 * This ensures currency is always calculated from total score (20:1 ratio)
 * @param totalScore - Total score from profile stats
 * @returns The currency amount that should be set
 */
export function syncCurrencyWithTotalScore(totalScore: number): number {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    console.warn('Cannot sync currency: No active profile');
    return 0;
  }

  // Calculate what currency should be based on total score
  const expectedCurrency = convertTotalScoreToCurrency(totalScore);
  
  try {
    const data = loadCurrencyData(profileId);
    const currentCurrency = data.currency;
    const currencyDifference = expectedCurrency - currentCurrency;
    
    // Only update if there's a difference (to avoid unnecessary transactions)
    if (currencyDifference !== 0) {
      // Update currency to match total score
      data.currency = expectedCurrency;
      
      // Update totalEarned if currency increased
      if (currencyDifference > 0) {
        data.totalEarned += currencyDifference;
        
        // Add transaction for the currency gained
        data.transactions.push({
          id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'earned',
          amount: currencyDifference,
          timestamp: Date.now(),
          description: `Synced from total score (${totalScore} points)`,
        });
      }
      
      // Keep only last 100 transactions
      if (data.transactions.length > 100) {
        data.transactions = data.transactions.slice(-100);
      }
      
      saveCurrencyData(profileId, data);
    }
    
    return expectedCurrency;
  } catch (error) {
    console.error('Error syncing currency with total score:', error);
    return 0;
  }
}

/**
 * Reset currency for a profile (for testing/debugging)
 */
export function resetCurrency(): void {
  const profileId = getCurrentProfileId();
  if (!profileId) return;

  const data: CurrencyData = {
    currency: 0,
    totalEarned: 0,
    transactions: [],
  };
  saveCurrencyData(profileId, data);
}


