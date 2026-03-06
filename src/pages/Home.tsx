import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MonthlyOverviewCard } from '../components/MonthlyOverviewCard';
import { IconSymbol } from '../components/IconSymbol';
import { useTransactionEditor } from '../context/TransactionEditorContext';
import { useRecentTransactions } from '../hooks/useRecentTransactions';
import { useMonthlyOverview } from '../hooks/useMonthlyOverview';

export function Home() {
  const { openCreate } = useTransactionEditor();
  const {
    transactions: recentTransactionsRaw,
    loading: recentTransactionsLoading,
    errorMessage: recentError
  } = useRecentTransactions(10);
  const {
    monthLabel,
    totalIncome,
    totalExpense,
    balance,
    loading: overviewLoading,
    error: overviewError,
    refresh: refreshMonthlyOverview
  } = useMonthlyOverview();

  const formattedTransactions = useMemo(() => {
    return recentTransactionsRaw.map((transaction) => {
      const isIncome = transaction.type === 'INCOME';
      const displayAmount = transaction.amount;
      const formattedDate = transaction.date
        .toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit'
        })
        .toUpperCase();
      return {
        id: transaction.id,
        name: transaction.title || 'Quick Add',
        date: formattedDate,
        category: transaction.categoryName || (isIncome ? 'INCOME' : 'EXPENSE'),
        amount: displayAmount,
        isIncome
      };
    });
  }, [recentTransactionsRaw]);

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="p-5 pb-24">
        <MonthlyOverviewCard
          monthLabel={monthLabel}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          loading={overviewLoading}
          error={overviewError}
          onRefresh={refreshMonthlyOverview}
        />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-brand-text">Recent Activity</h2>
          <Link to="/history" className="text-sm font-normal text-brand-primary">
            View All
          </Link>
        </div>

        {recentTransactionsLoading ? (
          <p className="text-sm text-[#8B8B8B] text-center py-4">Loading transactions...</p>
        ) : recentError ? (
          <p className="text-sm text-[#8B8B8B] text-center py-4">{recentError}</p>
        ) : formattedTransactions.length === 0 ? (
          <p className="text-sm font-medium text-brand-text text-center py-4">
            You have no transactions yet.
          </p>
        ) : (
          <div className="space-y-3">
            {formattedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center p-4 rounded-[16px]"
                style={{ backgroundColor: '#262727' }}
              >
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#4A5A3A' }}
                >
                  <IconSymbol
                    name={transaction.isIncome ? 'cash' : 'card'}
                    size={24}
                    color="#B4DE00"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-brand-text mb-1">
                    {transaction.name}
                  </p>
                  <p className="text-[13px] font-normal text-[#8B8B8B]">
                    {transaction.date} • {transaction.category}
                  </p>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: transaction.isIncome ? '#B4DE00' : '#FFFEFF'
                  }}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openCreate}
        className="fixed right-5 bottom-24 w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center shadow-lg"
        style={{ boxShadow: '0 4px 8px rgba(180, 222, 0, 0.3)' }}
        aria-label="Add transaction"
      >
        <IconSymbol name="add" size={32} color="#000000" />
      </button>
    </div>
  );
}
