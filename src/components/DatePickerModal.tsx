import { useState, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { IconSymbol } from './IconSymbol';
import 'react-day-picker/style.css';

interface DatePickerModalProps {
  visible: boolean;
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  onClose: () => void;
}

export function DatePickerModal({ visible, selected, onSelect, onClose }: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selected || new Date());

  const handleDayClick = useCallback(
    (date: Date | undefined) => {
      onSelect(date);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleClear = useCallback(() => {
    onSelect(undefined);
    onClose();
  }, [onSelect, onClose]);

  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      <div className='absolute inset-0 bg-black/70' onClick={onClose} />
      <div className='relative w-full max-w-md bg-brand-background rounded-t-3xl p-6 pb-8'>
        <div className='flex justify-between items-center mb-4'>
          <div className='w-10 h-1 bg-[#3A3B3B] rounded-xs' />
          <button onClick={onClose} className='p-1'>
            <IconSymbol name='close' size={28} color='#FFFEFF' />
          </button>
        </div>

        <div className='flex justify-center mb-4'>
          <DayPicker
            mode='single'
            required={false}
            selected={selected}
            onSelect={handleDayClick}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className='custom-day-picker'
          />
        </div>

        <div className='flex gap-3'>
          <button
            onClick={handleClear}
            className='flex-1 h-12 rounded-[14px] border border-[#3A3B3B] flex items-center justify-center'
          >
            <span className='text-base font-semibold text-brand-text'>Clear</span>
          </button>
          <button
            onClick={onClose}
            className='flex-1 h-12 rounded-[14px] bg-brand-primary flex items-center justify-center'
            style={{ boxShadow: '0 4px 8px rgba(180, 222, 0, 0.3)' }}
          >
            <span className='text-base font-bold text-brand-text-primary'>Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
