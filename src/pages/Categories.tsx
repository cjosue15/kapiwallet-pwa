import { useState, useMemo } from 'react';
import { useCategories, type Category } from '../hooks/useCategories';
import { IconSymbol } from '../components/IconSymbol';
import { SwipeableRow } from '../components/SwipeableRow';

const AVAILABLE_ICONS = [
  'restaurant', 'car', 'bag-handle', 'film', 'shield-checkmark',
  'home', 'airplane', 'medical', 'cafe', 'fitness',
  'gift', 'book', 'paw', 'game-controller', 'barbell',
  'bicycle', 'cash', 'school', 'brush', 'leaf',
  'fast-food', 'ice-cream', 'flower', 'hammer', 'heart',
  'people', 'rocket', 'shirt', 'subway', 'wine',
  'pizza', 'planet', 'musical-notes'
];

export function Categories() {
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('grid');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  const {
    categories,
    loading,
    saving,
    errorMessage,
    createCategory,
    removeCategory,
    updateCategory
  } = useCategories();

  const isSaveDisabled = saving || !categoryName.trim();
  const isEditing = Boolean(editingCategoryId);
  const modalTitle = isEditing ? 'Edit Category' : 'New Category';
  const primaryButtonLabel = saving
    ? 'Saving…'
    : isEditing
      ? 'Update'
      : 'Create';

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    const query = searchQuery.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const resetForm = () => {
    setCategoryName('');
    setSelectedIcon('grid');
    setEditingCategoryId(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIconPickerVisible(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      return;
    }

    const payload = {
      name: categoryName,
      icon: selectedIcon
    };

    const success = editingCategoryId
      ? await updateCategory(editingCategoryId, payload)
      : await createCategory(payload);

    if (success) {
      resetForm();
      setModalVisible(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setSelectedIcon(category.icon);
    setModalVisible(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const removed = await removeCategory(id);
    if (removed && editingCategoryId === id) {
      closeModal();
    }
  };

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="p-5 pb-24">
        <div className="flex items-center gap-3 mb-6 pt-4">
          <div className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: '#4A5A3A' }}>
            <IconSymbol name="apps" size={24} color="#B4DE00" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-brand-text">Categories</h1>
            <p className="text-[13px] text-[#8B8B8B] mt-1">
              Organize spending buckets and keep things tidy.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] p-5 mb-5" style={{ backgroundColor: '#262727' }}>
          <p className="text-[14px] font-semibold text-[#8B8B8B]">Active categories</p>
          <p className="text-[32px] font-bold text-brand-text font-mono-numbers">{categories.length}</p>
          <p className="text-[13px] text-[#8B8B8B]">
            Tap "New" to add another bucket.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-[16px] mb-5" style={{ backgroundColor: '#262727' }}>
          <IconSymbol name="search" size={20} color="#666666" />
          <input
            type="text"
            placeholder="Search categories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base text-brand-text placeholder:text-[#666666]"
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')}>
              <IconSymbol name="close" size={20} color="#666666" />
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="text-[13px] text-brand-expense mb-2">{errorMessage}</p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-15 gap-2">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-semibold text-brand-text">Loading categories…</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-15 gap-2">
            <IconSymbol name="leaf" size={28} color="#B4DE00" />
            <p className="text-base font-semibold text-brand-text">
              {searchQuery ? 'No matches found' : 'No categories yet'}
            </p>
            <p className="text-[13px] text-[#8B8B8B] text-center">
              {searchQuery
                ? 'Try a different keyword.'
                : 'Use the New button to create your first category.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <SwipeableRow
                key={category.id}
                onEdit={() => handleEditCategory(category)}
                onDelete={() => handleDeleteCategory(category.id)}
              >
                <div
                  className="rounded-[20px] p-5"
                  style={{ backgroundColor: '#262727' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-[12px] flex items-center justify-center"
                      style={{ backgroundColor: category.iconBg }}
                    >
                      <IconSymbol name={category.icon || 'apps'} size={24} color="#B4DE00" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-brand-text">{category.name}</p>
                      <p className="text-[13px] text-[#8B8B8B]">Swipe to edit</p>
                    </div>
                    <button onClick={() => handleEditCategory(category)}>
                      <IconSymbol name="chevron-forward" size={20} color="#666666" />
                    </button>
                  </div>
                </div>
              </SwipeableRow>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={openCreateModal}
        className="fixed right-5 bottom-24 flex items-center gap-2 px-5 py-3 rounded-[14px] bg-brand-primary shadow-lg"
        style={{ boxShadow: '0 6px 12px rgba(180, 222, 0, 0.3)' }}
      >
        <IconSymbol name="add" size={20} color="#000000" />
        <span className="text-[15px] font-bold text-brand-text-primary">New</span>
      </button>

      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-brand-card rounded-t-[24px] p-6 pb-12 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-text">{modalTitle}</h2>
              <button onClick={closeModal}>
                <IconSymbol name="close" size={28} color="#FFFEFF" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-brand-text mb-2">Category Name</p>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full h-14 rounded-[12px] px-4 text-base bg-brand-background text-brand-text border border-[#3A3B3B] outline-none placeholder:text-[#666666]"
              />

              <p className="text-sm font-bold text-brand-text mt-4 mb-2">Choose Icon</p>
              <button
                onClick={() => setIconPickerVisible(true)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-[16px] bg-brand-background border border-[#3A3B3B]"
              >
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center bg-[#2C2C2C]">
                  <IconSymbol name={selectedIcon} size={24} color="#B4DE00" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-brand-text uppercase">{selectedIcon}</p>
                  <p className="text-[13px] text-[#8B8B8B]">Tap to open icon library</p>
                </div>
                <IconSymbol name="chevron-forward" size={20} color="#666666" />
              </button>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={closeModal}
                className="flex-1 h-14 rounded-[12px] border border-[#3A3B3B] flex items-center justify-center"
              >
                <span className="text-base font-bold text-brand-text">Cancel</span>
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isSaveDisabled}
                className={`flex-1 h-14 rounded-[12px] flex items-center justify-center ${
                  isSaveDisabled ? 'opacity-50' : 'bg-brand-primary'
                }`}
              >
                <span className="text-base font-bold text-brand-text-primary">{primaryButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {iconPickerVisible && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIconPickerVisible(false)} />
          <div className="relative w-full max-w-md bg-brand-card rounded-t-[24px] p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-text">Choose Icon</h3>
              <button onClick={() => setIconPickerVisible(false)}>
                <IconSymbol name="close" size={24} color="#FFFEFF" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => {
                    setSelectedIcon(icon);
                    setIconPickerVisible(false);
                  }}
                  className={`w-14 h-14 rounded-[12px] flex items-center justify-center border-2 transition-colors ${
                    selectedIcon === icon
                      ? 'border-brand-primary bg-brand-primary'
                      : 'border-[#3A3B3B] bg-brand-background'
                  }`}
                >
                  <IconSymbol
                    name={icon}
                    size={24}
                    color={selectedIcon === icon ? '#000000' : '#B4DE00'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
