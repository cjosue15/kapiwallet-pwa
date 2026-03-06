import { useCallback, useEffect, useState } from 'react';

import { fetchTransactionsQuery } from '../lib/queries/transaction';

import {
  normalizeTransaction,
  useTransactions,
  type Transaction
} from '../context/TransactionsContext';

interface UseRecentTransactionsResult {
  transactions: Transaction[];
  loading: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

export function useRecentTransactions(limit = 10): UseRecentTransactionsResult {
  const { version } = useTransactions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const { data, error } = await fetchTransactionsQuery(limit);
    if (error) {
      console.error('Error fetching recent transactions', error);
      setErrorMessage('No se pudieron cargar las transacciones recientes.');
      setTransactions([]);
    } else {
      setTransactions(data.map(normalizeTransaction));
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent, version]);

  return {
    transactions,
    loading,
    errorMessage,
    refresh: fetchRecent
  };
}
