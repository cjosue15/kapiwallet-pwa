import { supabase } from '../supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface CategoryRecord {
  id: string | number;
  name: string;
  icon: string;
}

export type CategoryPayload = Pick<CategoryRecord, 'name' | 'icon'>;

export async function fetchCategoriesQuery() {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,icon')
    .order('name');
  return { data: data ?? [], error } as {
    data: CategoryRecord[];
    error: PostgrestError | null;
  };
}

export async function insertCategory(payload: CategoryPayload) {
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select('id,name,icon')
    .single();
  return { data, error } as {
    data: CategoryRecord | null;
    error: PostgrestError | null;
  };
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return { error };
}

export async function updateCategory(id: string, payload: CategoryPayload) {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('id,name,icon')
    .single();
  return { data, error } as {
    data: CategoryRecord | null;
    error: PostgrestError | null;
  };
}
