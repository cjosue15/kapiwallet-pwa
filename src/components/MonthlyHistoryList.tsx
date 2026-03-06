import { useMemo } from 'react';

export interface MonthlyHistoryEntry {
  month?: string;
  label: string;
  amount: number;
  income: number;
  expense: number;
}

interface MonthlyHistoryListProps {
  entries: MonthlyHistoryEntry[];
}

export function MonthlyHistoryList({ entries }: MonthlyHistoryListProps) {
  const computedEntries = useMemo(() => {
    if (!entries || entries.length === 0) {
      return [];
    }

    const chronological = [...entries];
    return chronological
      .map((entry, index) => {
        const previous = index > 0 ? chronological[index - 1] : null;
        const change = previous ? entry.amount - previous.amount : 0;
        return {
          ...entry,
          change,
          hasComparison: Boolean(previous),
          comparedTo: previous?.label ?? null
        };
      })
      .reverse();
  }, [entries]);

  if (computedEntries.length === 0) {
    return (
      <div className="bg-brand-card rounded-[24px] p-6 border border-brand-background">
        <div className="flex flex-col items-center justify-center py-6 gap-1.5">
          <p className="text-base font-semibold text-brand-text">No history yet</p>
          <p className="text-[13px] text-[#8F9091] text-center">
            Add transactions to compare your performance across months.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-card rounded-[24px] p-3 border border-brand-background">
      {computedEntries.map((entry, index) => {
        const changePositive = entry.change >= 0;
        const changeValue = Math.abs(entry.change);
        const subLabel =
          index === 0
            ? 'Current period'
            : entry.comparedTo
              ? `vs ${entry.comparedTo}`
              : 'Previous period';
        return (
          <div
            key={entry.label}
            className="flex justify-between items-center py-3.5 px-3 rounded-[18px] my-1"
            style={{ backgroundColor: '#2F3030' }}
          >
            <div>
              <p className="text-[17px] font-bold text-brand-text">{entry.label}</p>
              <p className="text-[13px] text-[#7A7B7D]">{subLabel}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[18px] font-bold text-brand-text">
                S/ {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              {entry.hasComparison ? (
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: changePositive ? '#B4DE00' : '#E45865' }}
                >
                  {changePositive ? '↑' : '↓'}S/ {changeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              ) : (
                <p className="text-[14px] text-[#7A7B7D]">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
