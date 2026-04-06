import { supabase } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionRecord {
  id: string | number;
  title: string;
  amount: number;
  date: string;
  category_id: string | null;
  type: TransactionType;
  category?: {
    id: string | number;
    name: string;
    icon?: string | null;
  } | null;
}

export interface TransactionInsertPayload {
  title: string;
  amount: number;
  date: string;
  category_id?: string | null;
  type: TransactionType;
}

export interface TransactionUpdatePayload {
  title?: string;
  amount?: number;
  date?: string;
  category_id?: string | null;
  type?: TransactionType;
}

export interface TransactionSummaryRecord {
  id: string | number;
  amount: number;
  date: string;
  type: TransactionType;
}

export interface CategorySummaryRecord {
  category_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  total_amount: number;
  transaction_count: number;
  type: TransactionType;
}

export async function fetchTransactionsQuery(limit?: number) {
  let query = supabase
    .from('transactions')
    .select(
      'id,title,amount,date,category_id,type,category:categories(id,name,icon)'
    )
    .order('date', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  return { data: data ?? [], error } as unknown as {
    data: TransactionRecord[];
    error: PostgrestError | null;
  };
}

export async function insertTransaction(payload: TransactionInsertPayload) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select(
      'id,title,amount,date,category_id,type,category:categories(id,name,icon)'
    )
    .single();
  return { data, error } as {
    data: TransactionRecord | null;
    error: PostgrestError | null;
  };
}

export async function fetchTransactionsByDateRange(
  startDateIso: string,
  endDateIso: string
) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id,amount,date,type')
    .gte('date', startDateIso)
    .lte('date', endDateIso)
    .order('date', { ascending: false });
  return { data: (data ?? []) as TransactionSummaryRecord[], error } as {
    data: TransactionSummaryRecord[];
    error: PostgrestError | null;
  };
}

export async function updateTransactionRecord(
  id: string,
  payload: TransactionUpdatePayload
) {
  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select(
      'id,title,amount,date,category_id,type,category:categories(id,name,icon)'
    )
    .single();
  return { data, error } as {
    data: TransactionRecord | null;
    error: PostgrestError | null;
  };
}

export async function deleteTransactionRecord(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  return { error };
}

export async function fetchCategorySummary(
  startDateIso?: string,
  endDateIso?: string
) {
  let query = supabase
    .from('transactions')
    .select(`
      category_id,
      category:categories(id, name, icon),
      amount,
      type,
      date
    `)
    .order('date', { ascending: false });

  if (startDateIso && endDateIso) {
    query = query.gte('date', startDateIso).lte('date', endDateIso);
  } else if (startDateIso) {
    query = query.gte('date', startDateIso);
  } else if (endDateIso) {
    query = query.lte('date', endDateIso);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [] as CategorySummaryRecord[], error } as {
      data: CategorySummaryRecord[];
      error: PostgrestError | null;
    };
  }

  const aggregated = new Map<string, CategorySummaryRecord>();

  for (const row of data ?? []) {
    const catId = row.category_id ?? 'uncategorized';
    const catName = (row.category as { name?: string } | null)?.name ?? 'Uncategorized';
    const catIcon = (row.category as { icon?: string } | null)?.icon ?? 'apps';
    const key = `${catId}-${row.type}`;

    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.total_amount += Math.abs(row.amount);
      existing.transaction_count += 1;
    } else {
      aggregated.set(key, {
        category_id: row.category_id,
        category_name: catName,
        category_icon: catIcon,
        total_amount: Math.abs(row.amount),
        transaction_count: 1,
        type: row.type
      });
    }
  }

  return {
    data: Array.from(aggregated.values()),
    error: null
  };
}
