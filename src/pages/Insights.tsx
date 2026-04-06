import { useState, useMemo } from 'react';
import { InsightsFilterButton, type InsightsQuickFilter } from '../components/InsightsFilterButton';
import { InsightsOverflowMenu } from '../components/InsightsOverflowMenu';
import { MonthlyHistoryChart } from '../components/MonthlyHistoryChart';
import { MonthlyHistoryList } from '../components/MonthlyHistoryList';
import { TotalBalanceCard } from '../components/TotalBalanceCard';
import { CategoryBarChart } from '../components/CategoryBarChart';
import { useMonthlyHistory } from '../hooks/useMonthlyHistory';
import { useCategoryInsights } from '../hooks/useCategoryInsights';
import { IconSymbol } from '../components/IconSymbol';

export function Insights() {
  const {
    entries: monthlyHistoryEntries,
    loading: historyLoading,
    error: historyError,
    refresh: refreshMonthlyHistory,
  } = useMonthlyHistory();
  const {
    incomeCategories,
    expenseCategories,
    loading: categoryLoading,
    refresh: refreshCategories,
  } = useCategoryInsights();
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
        amount,
      };
    });
  }, [monthlyHistoryEntries, quickFilter]);

  const handleRefresh = () => {
    refreshMonthlyHistory();
    refreshCategories();
  };

  return (
    <div className='min-h-screen bg-brand-background pb-10'>
      <div className='p-5 pt-12'>
        <div className='bg-brand-card rounded-[28px] p-5 mb-6 border border-brand-background'>
          <div className='flex justify-between items-center mb-6'>
            <InsightsFilterButton value={quickFilter} onChange={setQuickFilter} />
            <h2 className='text-xl font-bold text-brand-text'>Insights</h2>
            <InsightsOverflowMenu entries={monthlyHistoryEntries} filter={quickFilter} />
          </div>

          <TotalBalanceCard entries={monthlyHistoryEntries} loading={historyLoading} />

          <div className='mt-4'>
            <MonthlyHistoryChart entries={displayEntries} loading={historyLoading} />
          </div>
        </div>

        <div className='flex justify-between items-center mb-3'>
          <div>
            <h3 className='text-xl font-bold text-brand-text'>Monthly History</h3>
            <p className='text-sm text-[#8F9091]'>Compare recent periods</p>
          </div>
          <button
            type='button'
            onClick={handleRefresh}
            disabled={historyLoading || categoryLoading}
            className={`w-9 h-9 rounded-full border border-[#2F3133] flex items-center justify-center transition-opacity ${
              historyLoading || categoryLoading ? 'opacity-60' : ''
            }`}
            aria-label='Refresh monthly history'
          >
            <IconSymbol name='refresh' size={18} color='#FFFEFF' />
          </button>
        </div>
        {historyError && <p className='text-[13px] text-[#E45865] mb-2'>{historyError}</p>}
        {historyLoading && monthlyHistoryEntries.length === 0 ? (
          <div className='flex items-center justify-center py-4'>
            <div className='w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin' />
          </div>
        ) : null}
        <MonthlyHistoryList entries={displayEntries} />
        <div className='grid grid-cols-1 gap-4 mt-6'>
          <div className='bg-brand-card rounded-[20px] p-4 border border-brand-background'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-[14px] font-bold text-brand-text'>Income</h3>
              <span className='text-[11px] text-[#B4DE00] font-semibold'>BY CATEGORY</span>
            </div>
            <CategoryBarChart categories={incomeCategories} loading={categoryLoading} type='income' />
          </div>

          <div className='bg-brand-card rounded-[20px] p-4 border border-brand-background'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-[14px] font-bold text-brand-text'>Expenses</h3>
              <span className='text-[11px] text-[#FF4D4D] font-semibold'>BY CATEGORY</span>
            </div>
            <CategoryBarChart categories={expenseCategories} loading={categoryLoading} type='expense' />
          </div>
        </div>
      </div>
    </div>
  );
}
