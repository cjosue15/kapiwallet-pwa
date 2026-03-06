import { useMemo } from 'react';

interface MonthlyHistoryEntry {
  label: string;
  amount: number;
  income: number;
  expense: number;
}

interface TotalBalanceCardProps {
  entries: MonthlyHistoryEntry[];
  loading: boolean;
}

export function TotalBalanceCard({ entries, loading }: TotalBalanceCardProps) {
  const balanceMetrics = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        currentBalance: null,
        balanceLabel: null,
        changePercent: null,
        changePositive: true
      };
    }

    const latest = entries[entries.length - 1];
    const previous = entries.length > 1 ? entries[entries.length - 2] : null;

    const currentBalance = latest.amount;
    let changePercent: number | null = null;
    if (previous) {
      const delta = latest.amount - previous.amount;
      if (previous.amount !== 0) {
        changePercent = (delta / Math.abs(previous.amount)) * 100;
      } else if (delta !== 0) {
        changePercent = delta > 0 ? 100 : -100;
      } else {
        changePercent = 0;
      }
    }

    const changePositive = (changePercent ?? 0) >= 0;

    return {
      currentBalance,
      balanceLabel: latest.label,
      changePercent,
      changePositive
    };
  }, [entries]);

  const formatCurrency = (value: number) =>
    `S/ ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const balanceDisplay = balanceMetrics.currentBalance;
  const changePercentDisplay = balanceMetrics.changePercent;
  const changePositive = balanceMetrics.changePositive;
  const changeColor =
    changePercentDisplay === null
      ? '#8F9091'
      : changePositive
        ? '#B4DE00'
        : '#E45865';
  const changeText =
    changePercentDisplay === null
      ? '—'
      : `${changePositive ? '+' : '-'}${Math.abs(changePercentDisplay).toFixed(1)}%`;

  const formattedBalance =
    balanceDisplay !== null
      ? formatCurrency(balanceDisplay)
      : loading
        ? 'Loading…'
        : 'S/ 0.00';

  return (
    <div className="mb-4">
      <p className="text-[12px] font-medium text-[#8F9091] tracking-[1px] mb-2">
        {balanceMetrics.balanceLabel
          ? `TOTAL BALANCE • ${balanceMetrics.balanceLabel.toUpperCase()}`
          : 'TOTAL BALANCE'}
      </p>
      <div className="flex items-center mb-4">
        <p className="text-[42px] font-bold text-brand-text">{formattedBalance}</p>
        {changePercentDisplay !== null ? (
          <div
            className="ml-3 rounded-full px-3 py-1"
            style={{ backgroundColor: '#2E3414' }}
          >
            <span className="text-[13px] font-semibold" style={{ color: changeColor }}>
              {changeText}
            </span>
          </div>
        ) : (
          <div
            className="ml-3 rounded-full px-3 py-1 border"
            style={{ backgroundColor: '#2F3133', borderColor: '#3A3B3B' }}
          >
            <span className="text-[13px] font-semibold" style={{ color: changeColor }}>
              {changeText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
