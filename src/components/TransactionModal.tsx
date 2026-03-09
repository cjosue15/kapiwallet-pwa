import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconSymbol } from './IconSymbol';
import { DatePickerModal } from './DatePickerModal';
import { useCategories } from '../hooks/useCategories';

export interface TransactionFormValues {
  type: 'income' | 'expense';
  amount: number;
  note: string;
  category: string;
  categoryId: string | null;
  date: Date;
}

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (values: TransactionFormValues) => void;
  mode?: 'create' | 'edit';
  initialValues?: TransactionFormValues | null;
}

interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
}

export function TransactionModal({
  visible,
  onClose,
  onSave,
  mode = 'create',
  initialValues
}: TransactionModalProps) {
  const { categories, loading: categoriesLoading, refreshCategories } = useCategories();

  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(() => 
    initialValues?.type === 'income' ? 'income' : 'expense'
  );
  const [amount, setAmount] = useState(() => 
    initialValues?.amount ? String(Math.abs(initialValues.amount)) : ''
  );
  const [note, setNote] = useState(() => initialValues?.note ?? '');
  const [selectedCategoryName, setSelectedCategoryName] = useState(() => initialValues?.category ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(() => initialValues?.categoryId ?? null);
  const [transactionDate, setTransactionDate] = useState(() => initialValues?.date ?? new Date());
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const formattedDate = useMemo(() => {
    return transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }, [transactionDate]);

  const categoryOptions: CategoryOption[] = useMemo(() => {
    return categories;
  }, [categories]);

  const resetForm = useCallback(() => {
    setTransactionType('expense');
    setAmount('');
    setNote('');
    setSelectedCategoryName('');
    setSelectedCategoryId(null);
    setTransactionDate(new Date());
    setCategoryPickerVisible(false);
  }, []);

  useEffect(() => {
    if (visible) {
      refreshCategories();
    }
  }, [visible, refreshCategories]);

  const handleOpenCategoryPicker = useCallback(() => {
    setCategoryPickerVisible(true);
  }, []);

  const closeCategoryPicker = useCallback(() => {
    setCategoryPickerVisible(false);
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string, categoryName: string) => {
      setSelectedCategoryId(categoryId);
      setSelectedCategoryName(categoryName);
      closeCategoryPicker();
    },
    [closeCategoryPicker]
  );

  const showValidationMessage = useCallback((message: string) => {
    alert(message);
  }, []);

  const handleSave = useCallback(() => {
    if (!amount.trim()) {
      showValidationMessage('Please enter an amount.');
      return;
    }

    const normalizedAmount = Number(amount.replace(/,/g, '.'));
    if (Number.isNaN(normalizedAmount) || normalizedAmount === 0) {
      showValidationMessage('Amount must be greater than zero.');
      return;
    }

    if (!note.trim()) {
      showValidationMessage('Please add a note for this transaction.');
      return;
    }

    if (!selectedCategoryId || !selectedCategoryName) {
      showValidationMessage('Please select a category.');
      return;
    }

    onSave({
      type: transactionType,
      amount: normalizedAmount,
      note: note.trim(),
      category: selectedCategoryName.trim(),
      categoryId: selectedCategoryId,
      date: transactionDate
    });
    resetForm();
    onClose();
  }, [
    amount,
    note,
    selectedCategoryId,
    selectedCategoryName,
    transactionDate,
    transactionType,
    onSave,
    resetForm,
    onClose,
    showValidationMessage
  ]);

  const primaryActionLabel = mode === 'edit' ? 'Update Transaction' : 'Save Transaction';

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-brand-background rounded-t-[24px] p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="w-10 h-1 bg-[#3A3B3B] rounded-[2px]" />
          <button
            onClick={onClose}
            className="p-1"
          >
            <IconSymbol name="close" size={28} color="#FFFEFF" />
          </button>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex bg-[#2A2B2B] rounded-[30px] p-1 w-[85%]">
            <button
              onClick={() => setTransactionType('income')}
              className={`flex-1 py-3 rounded-[26px] text-sm font-bold tracking-wide transition-colors ${
                transactionType === 'income'
                  ? 'bg-brand-primary text-brand-text-primary'
                  : 'text-[#666666]'
              }`}
            >
              INCOME
            </button>
            <button
              onClick={() => setTransactionType('expense')}
              className={`flex-1 py-3 rounded-[26px] text-sm font-bold tracking-wide transition-colors ${
                transactionType === 'expense'
                  ? 'bg-brand-primary text-brand-text-primary'
                  : 'text-[#666666]'
              }`}
            >
              EXPENSE
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-center mb-2">
            <span className="text-[60px] font-bold text-brand-text mr-1 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>S/</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-[80px] font-bold text-brand-text bg-transparent border-none outline-none w-40 text-center p-0 placeholder:text-center [-moz-appearance:textfield] font-mono"
              placeholder="0"
              step="0.01"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
            <style>{`
              input[type="number"]::-webkit-outer-spin-button,
              input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}</style>
          </div>
          <span className="text-xs font-normal text-[#666666] tracking-[2px]">ENTER AMOUNT</span>
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-[#3A3B3B] pb-4">
          <IconSymbol name="menu" size={20} color="#666666" />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note"
            className="flex-1 text-base text-brand-text bg-transparent border-none outline-none p-0 placeholder:text-[#666666]"
          />
        </div>

        <button
          onClick={handleOpenCategoryPicker}
          className="flex items-center gap-4 w-full mb-6 border-b border-[#3A3B3B] pb-4"
        >
          <IconSymbol name="apps" size={20} color="#666666" />
          <div className="flex-1 flex justify-between items-center">
            <span className={`text-base ${selectedCategoryName ? 'text-brand-text' : 'text-[#666666]'}`}>
              {selectedCategoryName || 'Select Category'}
            </span>
            <IconSymbol name="chevron-forward" size={20} color="#666666" />
          </div>
        </button>

        <button
          onClick={() => setDatePickerVisible(true)}
          className="flex items-center gap-4 w-full mb-8 border-b border-[#3A3B3B] pb-4"
        >
          <IconSymbol name="calendar" size={20} color="#666666" />
          <div className="flex-1 flex justify-between items-center">
            <span className="text-base text-brand-text">{formattedDate}</span>
            <IconSymbol name="chevron-forward" size={20} color="#666666" />
          </div>
        </button>

        <button
          onClick={handleSave}
          className="w-full h-[60px] rounded-[16px] bg-brand-primary flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 4px 8px rgba(180, 222, 0, 0.3)' }}
        >
          <span className="text-lg font-bold text-brand-text-primary">
            {primaryActionLabel}
          </span>
        </button>

        {categoryPickerVisible && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70">
            <div
              className="absolute inset-0"
              onClick={closeCategoryPicker}
            />
            <div className="relative w-full max-w-md bg-brand-card rounded-t-[24px] p-6 pb-8 max-h-[70vh] overflow-y-auto">
              <div className="w-12 h-1 bg-[#3A3B3B] rounded-[2px] mx-auto mb-4" />
              <h3 className="text-base font-bold text-brand-text text-center mb-3">Select Category</h3>
              {categoriesLoading && categories.length === 0 ? (
                <p className="text-[#999999] text-center py-6">Loading categories...</p>
              ) : (
                <div className="space-y-0">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleCategorySelect(option.id, option.name)}
                      className={`flex items-center gap-4 w-full py-3.5 border-b border-[#2F3030] ${
                        selectedCategoryId === option.id ? 'border-b-brand-primary' : ''
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                        style={{ backgroundColor: option.iconBg }}
                      >
                        <IconSymbol name={option.icon || 'apps'} size={18} color="#B4DE00" />
                      </div>
                      <span className="flex-1 text-base font-semibold text-brand-text text-left">
                        {option.name}
                      </span>
                      {selectedCategoryId === option.id && (
                        <IconSymbol name="checkmark" size={20} color="#B4DE00" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={closeCategoryPicker}
                className="w-full h-12 rounded-[14px] border border-[#3A3B3B] mt-4 flex items-center justify-center"
              >
                <span className="text-base font-semibold text-brand-text">Cancel</span>
              </button>
            </div>
          </div>
        )}

        <DatePickerModal
          visible={datePickerVisible}
          selected={transactionDate}
          onSelect={(date) => {
            if (date) {
              setTransactionDate(date);
            }
          }}
          onClose={() => setDatePickerVisible(false)}
        />
      </div>
    </div>
  );
}
