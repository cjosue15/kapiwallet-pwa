import { useCallback, useEffect, useState } from 'react';

import { useTransactions } from '../context/TransactionsContext';
import {
  fetchMonthlySummary,
  type MonthlySummaryRecord
} from '../lib/queries/monthlySummary';

export interface MonthlyHistoryEntry {
  label: string;
  month: string;
  amount: number;
  income: number;
  expense: number;
}

const normalizeToDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const buildEntry = (
  record: MonthlySummaryRecord
): MonthlyHistoryEntry & { timestamp: number } => {
  const normalizedDate = normalizeToDay(new Date(record.month_start));
  const label = normalizedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
  const month = normalizedDate
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase();
  const incomeTotal = Number(record.income_total ?? 0);
  const expenseTotal = Number(record.expense_total ?? 0);

  return {
    label,
    month,
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
      const mapped = data
        .map((record) => buildEntry(record))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ timestamp, ...entry }) => entry);
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
