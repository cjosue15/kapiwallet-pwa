import { useState, useMemo } from 'react';
import { InsightsFilterButton, type InsightsQuickFilter } from '../components/InsightsFilterButton';
import { InsightsOverflowMenu } from '../components/InsightsOverflowMenu';
import { MonthlyHistoryChart } from '../components/MonthlyHistoryChart';
import { MonthlyHistoryList } from '../components/MonthlyHistoryList';
import { TotalBalanceCard } from '../components/TotalBalanceCard';
import { useMonthlyHistory } from '../hooks/useMonthlyHistory';
import { IconSymbol } from '../components/IconSymbol';

export function Insights() {
  const {
    entries: monthlyHistoryEntries,
    loading: historyLoading,
    error: historyError,
    refresh: refreshMonthlyHistory
  } = useMonthlyHistory();
  const [quickFilter, setQuickFilter] = useState<InsightsQuickFilter>('all');

  const displayEntries = useMemo(() => {
    if (quickFilter === 'all') {
      return monthlyHistoryEntries;
    }

    return monthlyHistoryEntries.map((entry) => {
      let amount = entry.amount;
      if (quickFilter === 'income') {
        amount = Math.abs(entry.income ?? 0);
      } else if (quickFilter === 'expense') {
        amount = -Math.abs(entry.expense ?? 0);
      }

      return {
        ...entry,
        amount
      };
    });
  }, [monthlyHistoryEntries, quickFilter]);

  return (
    <div className="min-h-screen bg-brand-background pb-10">
      <div className="p-5 pt-12">
        <div className="bg-brand-card rounded-[28px] p-5 mb-6 border border-brand-background">
          <div className="flex justify-between items-center mb-6">
            <InsightsFilterButton
              value={quickFilter}
              onChange={setQuickFilter}
            />
            <h2 className="text-xl font-bold text-brand-text">Insights</h2>
            <InsightsOverflowMenu
              entries={monthlyHistoryEntries}
              filter={quickFilter}
            />
          </div>

          <TotalBalanceCard
            entries={monthlyHistoryEntries}
            loading={historyLoading}
          />

          <div className="mt-4">
            <MonthlyHistoryChart
              entries={displayEntries}
              loading={historyLoading}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-xl font-bold text-brand-text">Monthly History</h3>
            <p className="text-sm text-[#8F9091]">Compare recent periods</p>
          </div>
          <button
            onClick={refreshMonthlyHistory}
            disabled={historyLoading}
            className={`w-9 h-9 rounded-full border border-[#2F3133] flex items-center justify-center transition-opacity ${
              historyLoading ? 'opacity-60' : ''
            }`}
            aria-label="Refresh monthly history"
          >
            <IconSymbol name="refresh" size={18} color="#FFFEFF" />
          </button>
        </div>

        {historyError && (
          <p className="text-[13px] text-[#E45865] mb-2">{historyError}</p>
        )}

        {historyLoading && monthlyHistoryEntries.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : null}

        <MonthlyHistoryList entries={displayEntries} />
      </div>
    </div>
  );
}
