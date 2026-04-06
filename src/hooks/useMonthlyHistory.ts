import { useCallback, useEffect, useState } from 'react';

import { useTransactions } from '../context/TransactionsContext';
import {
  fetchMonthlySummary,
  type MonthlySummaryRecord
} from '../lib/queries/monthlySummary';

export interface MonthlyHistoryEntry {
  label: string;
  month: string;
  monthStart: string;
  amount: number;
  income: number;
  expense: number;
}

const buildEntry = (
  record: MonthlySummaryRecord
): MonthlyHistoryEntry & { timestamp: number } => {
  const dateStr = record.month_start.split('T')[0];
  const [year, month, day] = dateStr.split('-').map(Number);
  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);
  const label = normalizedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  const monthShort = normalizedDate
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase();
  const incomeTotal = Number(record.income_total ?? 0);
  const expenseTotal = Number(record.expense_total ?? 0);

  const [year2, month2] = record.month_start.split('T')[0].split('-');
  const monthStartIso = `${year2}-${month2}-01`;

  return {
    label,
    month: monthShort,
    monthStart: monthStartIso,
    amount: Number(record.net_total ?? 0),
    income: incomeTotal,
    expense: expenseTotal,
    timestamp: normalizedDate.getTime()
  };
};

export function useMonthlyHistory() {
  const [entries, setEntries] = useState<MonthlyHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = useTransactions();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await fetchMonthlySummary();

    if (error) {
      console.error('Error fetching monthly summary', error);
      setEntries([]);
      setError('No se pudo cargar el historial mensual.');
    } else {
      const sortedEntries = data
        .map((record) => buildEntry(record))
        .sort((a, b) => a.timestamp - b.timestamp);
      const mapped: MonthlyHistoryEntry[] = sortedEntries.map(({ timestamp: _ts, ...rest }) => {
        void _ts;
        return rest as MonthlyHistoryEntry;
      });
      setEntries(mapped);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, version]);

  return {
    entries,
    loading,
    error,
    refresh: loadHistory
  };
}
