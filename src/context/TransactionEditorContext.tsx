import { TransactionModal, type TransactionFormValues } from '../components/TransactionModal';
import { useTransactions, type Transaction } from '../context/TransactionsContext';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

interface TransactionEditorContextValue {
  openCreate: () => void;
  openEdit: (transaction: Transaction) => void;
  close: () => void;
}

const TransactionEditorContext = createContext<TransactionEditorContextValue | null>(null);

export function TransactionEditorProvider({ children }: { children: ReactNode }) {
  const { createTransaction, updateTransaction } = useTransactions();

  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const openCreate = useCallback(() => {
    setMode('create');
    setEditingTransaction(null);
    setVisible(true);
  }, []);

  const openEdit = useCallback((transaction: Transaction) => {
    setMode('edit');
    setEditingTransaction(transaction);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setEditingTransaction(null);
  }, []);

  const initialValues = useMemo(() => {
    if (!editingTransaction) {
      return null;
    }
    return {
      type: editingTransaction.type === 'INCOME' ? 'income' : 'expense',
      amount: Math.abs(editingTransaction.amount),
      note: editingTransaction.title || '',
      category: editingTransaction.categoryName || '',
      categoryId: editingTransaction.categoryId,
      date: editingTransaction.date
    } satisfies TransactionFormValues;
  }, [editingTransaction]);

  const handleSave = useCallback(
    (values: TransactionFormValues) => {
      const persist = async () => {
        const normalizedAmount =
          values.type === 'income'
            ? Math.abs(values.amount)
            : -Math.abs(values.amount);

        const payload = {
          title: values.note.trim() || 'Quick Add',
          amount: normalizedAmount,
          date: values.date,
          categoryId: values.categoryId,
          categoryName: values.category || null,
          type: (values.type === 'income' ? 'INCOME' : 'EXPENSE') as Transaction['type']
        };

        if (mode === 'edit' && editingTransaction) {
          return updateTransaction(editingTransaction.id, payload);
        }
        return createTransaction(payload);
      };

      void (async () => {
        const success = await persist();
        if (success) {
          close();
        }
      })();
    },
    [close, createTransaction, editingTransaction, mode, updateTransaction]
  );

  const contextValue = useMemo(
    () => ({
      openCreate,
      openEdit,
      close
    }),
    [openCreate, openEdit, close]
  );

  return (
    <TransactionEditorContext.Provider value={contextValue}>
      {children}
      <TransactionModal
        visible={visible}
        onClose={close}
        onSave={handleSave}
        mode={mode}
        initialValues={initialValues}
      />
    </TransactionEditorContext.Provider>
  );
}

export function useTransactionEditor() {
  const context = useContext(TransactionEditorContext);
  if (!context) {
    throw new Error(
      'useTransactionEditor must be used within a TransactionEditorProvider'
    );
  }
  return context;
}
