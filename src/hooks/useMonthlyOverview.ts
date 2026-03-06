import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTransactions } from '../context/TransactionsContext';
import {
  fetchTransactionsByDateRange,
  type TransactionSummaryRecord
} from '../lib/queries/transaction';

interface MonthlyOverviewTotals {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const INITIAL_TOTALS: MonthlyOverviewTotals = {
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
};

const getMonthBoundaries = (reference: Date) => {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const nextMonth = new Date(
    reference.getFullYear(),
    reference.getMonth() + 1,
    1
  );
  return {
    startIso: start.toISOString(),
    endIso: nextMonth.toISOString(),
    label: start.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  };
};

const aggregateTotals = (records: TransactionSummaryRecord[]) => {
  return records.reduce<MonthlyOverviewTotals>(
    (totals, record) => {
      const amount = Number(record.amount) || 0;
      if (record.type === 'INCOME') {
        totals.totalIncome += Math.abs(amount);
      } else {
        totals.totalExpense += Math.abs(amount);
      }
      totals.balance += amount;
      return totals;
    },
    { ...INITIAL_TOTALS }
  );
};

export function useMonthlyOverview() {
  const [totals, setTotals] = useState<MonthlyOverviewTotals>(() => ({
    ...INITIAL_TOTALS
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceDate] = useState(() => new Date());
  const { version } = useTransactions();

  const { startIso, endIso, label } = useMemo(
    () => getMonthBoundaries(referenceDate),
    [referenceDate]
  );

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchTransactionsByDateRange(
      startIso,
      endIso
    );
    if (error) {
      console.error('Error fetching monthly overview', error);
      setTotals({ ...INITIAL_TOTALS });
      setError('No se pudo cargar el resumen mensual.');
    } else {
      setTotals(aggregateTotals(data));
    }
    setLoading(false);
  }, [startIso, endIso]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview, version]);

  return {
    monthLabel: label,
    totalIncome: totals.totalIncome,
    totalExpense: totals.totalExpense,
    balance: totals.balance,
    loading,
    error,
    refresh: fetchOverview
  };
}
