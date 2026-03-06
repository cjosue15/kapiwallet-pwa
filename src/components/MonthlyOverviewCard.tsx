import { IconSymbol } from './IconSymbol';

interface MonthlyOverviewCardProps {
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function MonthlyOverviewCard({
  monthLabel,
  totalIncome,
  totalExpense,
  balance,
  loading,
  error,
  onRefresh
}: MonthlyOverviewCardProps) {
  const balanceDisplay = loading
    ? '--'
    : `${balance < 0 ? '-' : ''}S/ ${formatCurrency(Math.abs(balance))}`;
  const incomeDisplay = loading ? '--' : `S/ ${formatCurrency(totalIncome)}`;
  const expenseDisplay = loading ? '--' : `S/ ${formatCurrency(totalExpense)}`;

  return (
    <div className="bg-brand-card rounded-[24px] p-6 mb-8">
      <div className="flex justify-between items-start mb-12">
        <div>
          <p className="text-[11px] font-normal text-[#8B8B8B] tracking-[1.5px] mb-1">
            MONTHLY OVERVIEW
          </p>
          <p className="text-base font-light text-brand-text">
            {monthLabel}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded-full hover:bg-[#2A2B2B] transition-colors disabled:opacity-50"
          aria-label="Refresh monthly overview"
        >
          <IconSymbol
            name="refresh-outline"
            size={24}
            color="#FFFEFF"
          />
        </button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <p className="text-sm font-normal text-[#8B8B8B] mb-3">Total Balance</p>
        <p className="text-[50px] font-bold text-brand-primary tracking-[-2px]">
          {balanceDisplay}
        </p>
      </div>

      <div className="flex justify-between gap-3 px-2">
        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-brand-primary flex-1 max-w-[48%]">
          <IconSymbol name="arrow-up" size={20} color="#B4DE00" />
          <span className="text-base font-bold text-brand-text">{incomeDisplay}</span>
        </div>
        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-brand-primary flex-1 max-w-[48%]">
          <IconSymbol name="arrow-down" size={20} color="#FF4D4D" />
          <span className="text-base font-bold text-brand-text">{expenseDisplay}</span>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-brand-expense text-center">{error}</p>
      )}
    </div>
  );
}
