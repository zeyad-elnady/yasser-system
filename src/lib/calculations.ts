import { Transaction } from '@/types';

/**
 * Recalculates running balances and sequence numbers row by row
 */
export function calculateBalances(transactions: Transaction[]): Transaction[] {
  let runningBalance = 0;

  return transactions.map((tx, index) => {
    const debit = Number(tx.debit) || 0;
    const credit = Number(tx.credit) || 0;
    
    // Balance formula: Previous + Credit (له) - Debit (عليه)
    runningBalance += credit - debit;

    return {
      ...tx,
      seq: index + 1,
      debit,
      credit,
      balance: runningBalance,
    };
  });
}

/**
 * Returns totals for a list of transactions
 */
export function getTotals(transactions: Transaction[]) {
  const totalDebit = transactions.reduce((sum, tx) => sum + (Number(tx.debit) || 0), 0);
  const totalCredit = transactions.reduce((sum, tx) => sum + (Number(tx.credit) || 0), 0);
  const finalBalance = totalCredit - totalDebit;

  return {
    totalDebit,
    totalCredit,
    finalBalance,
  };
}

/**
 * Format numbers with comma separators (e.g. 73,370 or empty if 0)
 */
export function formatAmount(amount?: number, showZero = false): string {
  if (amount === undefined || amount === null) return '';
  if (amount === 0 && !showZero) return '';
  return amount.toLocaleString('en-US');
}

