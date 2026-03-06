import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { IconSymbol } from './IconSymbol';
import type { InsightsQuickFilter } from './InsightsFilterButton';
import type { MonthlyHistoryEntry } from './MonthlyHistoryList';

interface InsightsOverflowMenuProps {
  entries: MonthlyHistoryEntry[];
  filter?: InsightsQuickFilter;
}

const FILTER_DESCRIPTION: Record<InsightsQuickFilter, string> = {
  all: 'all activity',
  income: 'income only',
  expense: 'expenses only'
};

const formatCurrency = (value: number) =>
  `S/ ${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const formatNumber = (value: number) => Number(value ?? 0).toFixed(2);

export function InsightsOverflowMenu({
  entries,
  filter = 'all'
}: InsightsOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shareSummary = useMemo(() => {
    if (!entries || entries.length === 0) {
      return 'No insights available yet. Add transactions to view your summary.';
    }

    const recentEntries = entries.slice(-3);
    const header = `Recent performance (${FILTER_DESCRIPTION[filter]})`;
    const lines = recentEntries.map((entry) => {
      const incomeText = formatCurrency(Math.abs(entry.income ?? 0));
      const expenseText = formatCurrency(Math.abs(entry.expense ?? 0));
      const netText = formatCurrency(entry.amount);
      return `${entry.label}: Net ${netText} (Income ${incomeText} · Expenses ${expenseText})`;
    });

    return [header, ...lines].join('\n');
  }, [entries, filter]);

  const csvExport = useMemo(() => {
    if (!entries || entries.length === 0) {
      return 'Month,Income,Expenses,Net';
    }

    const rows = entries.map((entry) =>
      [
        entry.label,
        formatNumber(Math.abs(entry.income ?? 0)),
        formatNumber(Math.abs(entry.expense ?? 0)),
        formatNumber(entry.amount ?? 0)
      ].join(',')
    );

    return ['Month,Income,Expenses,Net', ...rows].join('\n');
  }, [entries]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'Monthly insights summary',
        text: shareSummary
      });
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareSummary);
    }
  }, [shareSummary]);

  const handleExport = useCallback(() => {
    const blob = new Blob([csvExport], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kapiwallet-insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [csvExport]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-11 h-11 rounded-full border border-[#2F3133] bg-brand-background hover:bg-[#2A2B2B] transition-colors"
        aria-label="Open insights actions menu"
      >
        <IconSymbol name="ellipsis-vertical" size={20} color="#FFFEFF" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-brand-card rounded-[12px] border border-[#2F3133] shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              handleShare();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-brand-text hover:bg-[#2F3133] transition-colors"
          >
            Share report
          </button>
          <button
            onClick={() => {
              handleExport();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-brand-text hover:bg-[#2F3133] transition-colors"
          >
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
