import {
  deleteTransactionRecord,
  fetchTransactionsQuery,
  insertTransaction,
  type TransactionRecord,
  type TransactionType,
  updateTransactionRecord
} from '../lib/queries/transaction';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: Date;
  categoryId: string | null;
  categoryName: string | null;
  type: TransactionType;
}

export interface CreateTransactionInput {
  title: string;
  amount: number;
  date: Date;
  categoryId?: string | null;
  categoryName?: string | null;
  type: TransactionType;
}

export interface UpdateTransactionInput {
  title: string;
  amount: number;
  date: Date;
  categoryId?: string | null;
  categoryName?: string | null;
  type: TransactionType;
}

export const normalizeTransaction = (
  record: TransactionRecord
): Transaction => ({
  id: String(record.id),
  title: record.title,
  amount: record.amount,
  date: new Date(record.date),
  categoryId: record.category_id,
  categoryName: record.category?.name ?? null,
  type: record.type
});

const sortTransactions = (items: Transaction[]) =>
  [...items].sort((a, b) => b.date.getTime() - a.date.getTime());

interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  saving: boolean;
  errorMessage: string | null;
  createTransaction: (input: CreateTransactionInput) => Promise<boolean>;
  updateTransaction: (
    id: string,
    input: UpdateTransactionInput
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
  version: number;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null
);

function useProvideTransactions(): TransactionsContextValue {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const { data, error } = await fetchTransactionsQuery();
    if (error) {
      console.error('Error fetching transactions', error);
      setErrorMessage('No se pudieron cargar las transacciones.');
    } else {
      setTransactions(sortTransactions(data.map(normalizeTransaction)));
      setVersion((prev) => prev + 1);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      if (!input.title.trim()) {
        return false;
      }
      setSaving(true);
      setErrorMessage(null);
      let success = false;
      const payload = {
        title: input.title.trim(),
        amount: input.amount,
        date: input.date.toISOString(),
        category_id: input.categoryId ?? null,
        type: input.type
      };
      const { data, error } = await insertTransaction(payload);
      if (error || !data) {
        console.error('Error creating transaction', error);
        setErrorMessage('No se pudo guardar la transaccion.');
      } else {
        const normalized = normalizeTransaction(data);
        const withLabel =
          !normalized.categoryName && input.categoryName
            ? { ...normalized, categoryName: input.categoryName }
            : normalized;
        setTransactions((prev) => sortTransactions([withLabel, ...prev]));
        setVersion((prev) => prev + 1);
        success = true;
      }
      setSaving(false);
      return success;
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, input: UpdateTransactionInput) => {
      if (!input.title.trim()) {
        return false;
      }
      setSaving(true);
      setErrorMessage(null);
      let success = false;
      const payload = {
        title: input.title.trim(),
        amount: input.amount,
        date: input.date.toISOString(),
        category_id: input.categoryId ?? null,
        type: input.type
      };
      const { data, error } = await updateTransactionRecord(id, payload);
      if (error || !data) {
        console.error('Error updating transaction', error);
        setErrorMessage('No se pudo actualizar la transaccion.');
      } else {
        const normalized = normalizeTransaction(data);
        const withLabel =
          !normalized.categoryName && input.categoryName
            ? { ...normalized, categoryName: input.categoryName }
            : normalized;
        setTransactions((prev) =>
          sortTransactions(prev.map((tx) => (tx.id === id ? withLabel : tx)))
        );
        setVersion((prev) => prev + 1);
        success = true;
      }
      setSaving(false);
      return success;
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    setSaving(true);
    setErrorMessage(null);
    const { error } = await deleteTransactionRecord(id);
    if (error) {
      console.error('Error deleting transaction', error);
      setErrorMessage('No se pudo eliminar la transaccion.');
      setSaving(false);
      return false;
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setVersion((prev) => prev + 1);
    setSaving(false);
    return true;
  }, []);

  return useMemo(
    () => ({
      transactions,
      loading,
      saving,
      errorMessage,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      refetch: fetchTransactions,
      version
    }),
    [
      transactions,
      loading,
      saving,
      errorMessage,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      fetchTransactions,
      version
    ]
  );
}

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const value = useProvideTransactions();
  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionsProvider'
    );
  }
  return context;
}
