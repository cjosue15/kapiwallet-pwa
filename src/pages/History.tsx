import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions, type Transaction } from '../context/TransactionsContext';
import { useTransactionEditor } from '../context/TransactionEditorContext';
import { IconSymbol } from '../components/IconSymbol';

export function History() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { transactions, loading: transactionsLoading, deleteTransaction } = useTransactions();
  const { openEdit } = useTransactionEditor();

  const normalizeToDay = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const getDateKey = (date: Date) => normalizeToDay(date).getTime().toString();

  const isSameDay = (first: Date, second: Date) =>
    getDateKey(first) === getDateKey(second);

  const getDateLabel = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = getDateKey(today);
    const yesterdayKey = getDateKey(yesterday);
    const dateKey = getDateKey(date);

    if (dateKey === todayKey) {
      return 'TODAY';
    }
    if (dateKey === yesterdayKey) {
      return 'YESTERDAY';
    }
    const monthNames = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return transactions.filter((transaction) => {
      const titleMatch =
        query.length === 0
          ? true
          : (transaction.title?.toLowerCase().includes(query) ?? false);
      const categoryMatch =
        query.length === 0
          ? true
          : (transaction.categoryName?.toLowerCase().includes(query) ?? false);
      const amountMatch = transaction.amount
        .toString()
        .toLowerCase()
        .includes(query);
      const matchesQuery =
        query.length === 0 || titleMatch || categoryMatch || amountMatch;
      const matchesDate = selectedDate
        ? isSameDay(transaction.date, selectedDate)
        : true;
      return matchesQuery && matchesDate;
    });
  }, [transactions, searchQuery, selectedDate]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce<Record<string, Transaction[]>>(
      (acc, transaction) => {
        const dateKey = getDateKey(transaction.date);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
      },
      {}
    );
  }, [filteredTransactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort(
      (a, b) => Number(b) - Number(a)
    );
  }, [groupedTransactions]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Link
          to="/"
          className="w-11 h-11 rounded-full border border-[#3A3B3B] flex items-center justify-center"
        >
          <IconSymbol name="arrow-back" size={24} color="#FFFEFF" />
        </Link>
        <h1 className="text-2xl font-bold text-brand-text">History</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="w-10 h-10 rounded-full border border-[#3A3B3B] flex items-center justify-center"
          >
            <IconSymbol name="calendar-outline" size={20} color="#FFFEFF" />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full border border-[#3A3B3B] flex items-center justify-center"
          >
            <IconSymbol name="search" size={20} color="#FFFEFF" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="flex items-center mx-5 mb-3 px-4 py-3 rounded-[12px]" style={{ backgroundColor: '#262727' }}>
          <IconSymbol name="search" size={20} color="#666666" className="mr-2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base text-brand-text placeholder:text-[#666666]"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')}>
              <IconSymbol name="close" size={20} color="#666666" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 px-5 mb-3">
        <button
          onClick={() => setSelectedDate(new Date())}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-[#3A3B3B]"
        >
          <IconSymbol name="calendar-outline" size={16} color="#FFFEFF" />
          <span className="text-sm font-semibold text-brand-text">
            {selectedDate ? 'Change date filter' : 'Filter by date'}
          </span>
        </button>
        {selectedDate && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F1F1F]">
            <IconSymbol name="calendar" size={14} color="#666666" />
            <span className="text-[13px] text-brand-text">
              {formatSelectedDate(selectedDate)}
            </span>
            <button onClick={clearDateFilter}>
              <IconSymbol name="close" size={14} color="#666666" />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 pb-10">
        {transactionsLoading ? (
          <p className="text-sm text-[#8B8B8B] text-center mt-8">Loading history…</p>
        ) : sortedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-15 gap-2">
            <p className="text-base font-semibold text-brand-text">No transactions yet</p>
            <p className="text-[13px] text-[#8B8B8B] text-center">
              Create a transaction from the Home tab to see it here.
            </p>
          </div>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey} className="mb-8">
              <p className="text-[11px] font-normal text-[#666666] tracking-[2px] mb-4">
                {getDateLabel(new Date(Number(dateKey)))}
              </p>
              {groupedTransactions[dateKey]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((transaction) => {
                  const isIncome = transaction.type === 'INCOME';
                  const formattedTime = transaction.date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  const categoryLabel =
                    transaction.categoryName ||
                    (isIncome ? 'INCOME' : 'EXPENSE');
                  return (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-5 rounded-[16px] mb-3"
                      style={{ backgroundColor: '#262727' }}
                    >
                      <div className="flex-1">
                        <p className="text-lg font-bold text-brand-text mb-1">
                          {transaction.title || 'Quick Add'}
                        </p>
                        <p className="text-[13px] font-normal text-[#666666]">
                          {formattedTime} • {categoryLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className="text-xl font-bold"
                          style={{
                            color: isIncome ? '#B4DE00' : '#FFFEFF'
                          }}
                        >
                          {`${transaction.amount > 0 ? '+' : ''}S/ ${Math.abs(transaction.amount).toFixed(2)}`}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(transaction)}
                            className="w-8 h-8 rounded-full bg-[#2B2B2B] flex items-center justify-center"
                          >
                            <IconSymbol name="create" size={14} color="#FFFEFF" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center"
                          >
                            <IconSymbol name="trash" size={14} color="#000000" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
