import {
  type CategoryPayload,
  type CategoryRecord,
  deleteCategory as deleteCategoryMutation,
  fetchCategoriesQuery,
  insertCategory,
  updateCategory as updateCategoryMutation
} from '../lib/queries/categories';
import { useCallback, useEffect, useState } from 'react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
}

const normalizeCategory = (record: CategoryRecord): Category => ({
  id: String(record.id),
  name: record.name,
  icon: record.icon,
  iconBg: '#4A5A3A'
});

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    const { data, error } = await fetchCategoriesQuery();
    if (error) {
      console.error('Error fetching categories', error);
      setErrorMessage('No se pudieron cargar las categorias.');
    } else {
      setCategories(data.map(normalizeCategory));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(async (payload: CategoryPayload) => {
    if (!payload.name.trim()) {
      return false;
    }
    setSaving(true);
    setErrorMessage(null);
    let success = false;
    const { data, error } = await insertCategory({
      name: payload.name.trim(),
      icon: payload.icon
    });
    if (error || !data) {
      console.error('Error creating category', error);
      setErrorMessage('No se pudo crear la categoria.');
    } else {
      setCategories((prev) => [...prev, normalizeCategory(data)]);
      success = true;
    }
    setSaving(false);
    return success;
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    setErrorMessage(null);
    const { error } = await deleteCategoryMutation(id);
    if (error) {
      console.error('Error deleting category', error);
      setErrorMessage('No se pudo eliminar la categoria.');
      return false;
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return true;
  }, []);

  const updateCategory = useCallback(
    async (id: string, payload: CategoryPayload) => {
      if (!payload.name.trim()) {
        return false;
      }
      setSaving(true);
      setErrorMessage(null);
      let success = false;
      const { data, error } = await updateCategoryMutation(id, {
        name: payload.name.trim(),
        icon: payload.icon
      });
      if (error || !data) {
        console.error('Error updating category', error);
        setErrorMessage('No se pudo actualizar la categoria.');
      } else {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? normalizeCategory(data) : cat))
        );
        success = true;
      }
      setSaving(false);
      return success;
    },
    []
  );

  return {
    categories,
    loading,
    saving,
    errorMessage,
    createCategory,
    removeCategory,
    updateCategory,
    refreshCategories: fetchCategories
  };
}
