import { useState, useRef, useEffect } from 'react';

export type InsightsQuickFilter = 'all' | 'income' | 'expense';

interface InsightsFilterButtonProps {
  value?: InsightsQuickFilter;
  onChange?: (filter: InsightsQuickFilter) => void;
}

const FILTER_OPTIONS: { label: string; value: InsightsQuickFilter }[] = [
  { label: 'All activity', value: 'all' },
  { label: 'Only income', value: 'income' },
  { label: 'Only expenses', value: 'expense' }
];

export function InsightsFilterButton({
  value = 'all',
  onChange
}: InsightsFilterButtonProps) {
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

  const handleSelect = (filter: InsightsQuickFilter) => {
    onChange?.(filter);
    setIsOpen(false);
  };

  const showBadge = value !== 'all';
  const currentLabel = FILTER_OPTIONS.find((f) => f.value === value)?.label || 'All activity';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#2F3133] bg-brand-background hover:bg-[#2A2B2B] transition-colors"
        aria-label="Change insights quick filter"
      >
        <span className="text-sm text-brand-text">{currentLabel}</span>
        {showBadge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary border border-brand-background" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-brand-card rounded-[12px] border border-[#2F3133] shadow-lg z-50 overflow-hidden">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-text hover:bg-[#2F3133]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
