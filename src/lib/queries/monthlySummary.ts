import { supabase } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface MonthlySummaryRecord {
  month_start: string;
  income_total: number | null;
  expense_total: number | null;
  net_total: number | null;
}

export async function fetchMonthlySummary() {
  const { data, error } = await supabase.rpc('monthly_transaction_summary');

  return {
    data: (data ?? []) as MonthlySummaryRecord[],
    error: error as PostgrestError | null,
  };
}
