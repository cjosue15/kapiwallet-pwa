import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCategorySummary, type CategorySummaryRecord } from '../lib/queries/transaction';
import { useTransactions } from '../context/TransactionsContext';

export interface CategoryInsight {
  id: string;
  name: string;
  icon: string;
  amount: number;
  transactionCount: number;
  percentage: number;
  type: 'INCOME' | 'EXPENSE';
}

export function useCategoryInsights() {
  const [records, setRecords] = useState<CategorySummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = useTransactions();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchCategorySummary();
    if (fetchError) {
      console.error('Error fetching category summary', fetchError);
      setError('No se pudo cargar el resumen por categorias.');
      setRecords([]);
    } else {
      setRecords(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, version]);

  const incomeCategories = useMemo(() => {
    const incomeRecords = records.filter((r) => r.type === 'INCOME');
    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.total_amount, 0);
    return incomeRecords.map((r) => ({
      id: String(r.category_id ?? 'uncategorized'),
      name: r.category_name ?? 'Uncategorized',
      icon: r.category_icon ?? 'cash',
      amount: r.total_amount,
      transactionCount: r.transaction_count,
      percentage: totalIncome > 0 ? (r.total_amount / totalIncome) * 100 : 0,
      type: 'INCOME' as const
    }));
  }, [records]);

  const expenseCategories = useMemo(() => {
    const expenseRecords = records.filter((r) => r.type === 'EXPENSE');
    const totalExpense = expenseRecords.reduce((sum, r) => sum + r.total_amount, 0);
    return expenseRecords.map((r) => ({
      id: String(r.category_id ?? 'uncategorized'),
      name: r.category_name ?? 'Uncategorized',
      icon: r.category_icon ?? 'card',
      amount: r.total_amount,
      transactionCount: r.transaction_count,
      percentage: totalExpense > 0 ? (r.total_amount / totalExpense) * 100 : 0,
      type: 'EXPENSE' as const
    }));
  }, [records]);

  return {
    incomeCategories,
    expenseCategories,
    loading,
    error,
    refresh: fetchData
  };
}
