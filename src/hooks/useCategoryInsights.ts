import { useEffect, useMemo, useState } from 'react';
import { fetchCategorySummary, type CategorySummaryRecord } from '../lib/queries/transaction';

export interface CategoryInsight {
  id: string;
  name: string;
  icon: string;
  amount: number;
  transactionCount: number;
  percentage: number;
  type: 'INCOME' | 'EXPENSE';
}

const getLast6MonthsRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
};

const getMonthRange = (monthStartIso: string) => {
  const [year, month] = monthStartIso.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month - 1, 1);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export function useCategoryInsights(selectedMonthStart?: string | null) {
  const [records, setRecords] = useState<CategorySummaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let dateRange: { startDate: string; endDate: string };
      if (selectedMonthStart) {
        dateRange = getMonthRange(selectedMonthStart);
      } else {
        dateRange = getLast6MonthsRange();
      }

      const { data, error: fetchError } = await fetchCategorySummary(
        dateRange.startDate,
        dateRange.endDate
      );
      if (!isMounted) return;
      if (fetchError) {
        console.error('Error fetching category summary', fetchError);
        setError('No se pudo cargar el resumen por categorias.');
        setRecords([]);
      } else {
        setRecords(data);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedMonthStart]);

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
    refresh: () => {}
  };
}
