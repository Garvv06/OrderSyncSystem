import { useState, useEffect } from 'react';
import { getItems, addItem, updateItem, deleteItem, setAuthToken } from '../utils/storage';
import { Item, ItemCategory, ItemSize } from '../types';
import { Search, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface ItemsListProps {
  token: string;
}

export function ItemsList({ token }: ItemsListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    category: ItemCategory;
    sizes: ItemSize[];
  }>({
    name: '',
    category: 'Nuts',
    sizes: [{ size: '', stock: 0 }],
  });

  useEffect(() => {
    loadItems();
  }, [token]);

  const loadItems = async () => {
    try {
      setAuthToken(token);
      const itemsData = await getItems();
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories: ItemCategory[] = ['Nuts', 'Bolts', 'Fasteners', 'Screws', 'Scaffolding Items', 'Washers', 'Hand Tools'];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = categories.map((category) => ({
    category,
    items: filteredItems.filter((item) => item.category === category),
  }));

  const handleAddSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: '', stock: 0 }],
    });
  };

  const handleRemoveSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleSizeChange = (index: number, field: 'size' | 'stock', value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter item name');
      return;
    }

    const validSizes = formData.sizes.filter((s) => s.size.trim() !== '' && s.stock >= 0);
    if (validSizes.length === 0) {
      alert('Please add at least one valid size');
      return;
    }

    try {
      if (editingId) {
        await updateItem(editingId, { ...formData, sizes: validSizes });
      } else {
        await addItem({ ...formData, sizes: validSizes });
      }
      await loadItems();
      handleCancel();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item');
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      sizes: [...item.sizes],
    });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        await loadItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Nuts',
      sizes: [{ size: '', stock: 0 }],
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading items...</p>
      </div>
    );
  }

  // Render edit form component
  const renderEditForm = (item?: Item) => {
    const isEditing = !!item;
    
    return (
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
        <h3 className="mb-4 text-blue-900">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Hex Bolt"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">Sizes & Stock *</label>
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="size-4" />
                Add Size
              </button>
            </div>

            <div className="space-y-2">
              {formData.sizes.map((sizeData, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Size (e.g., M8, 10mm)"
                    value={sizeData.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    min="0"
                    value={sizeData.stock === 0 ? '' : sizeData.stock}
                    onChange={(e) => handleSizeChange(index, 'stock', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  {formData.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="size-4" />
              {isEditing ? 'Update Item' : 'Save Item'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
              <X className="size-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">📦 Item List (Master)</h2>
        <p className="text-gray-600">Manage all fastener items with their sizes and stock</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'All')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Button - Only show if not editing */}
      {!isAdding && !editingId && (
        <button
          onClick={() => setIsAdding(true)}
          className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="size-5" />
          Add New Item
        </button>
      )}

      {/* Add Form (Top of List) */}
      {isAdding && !editingId && (
        <div className="mb-6">
          {renderEditForm()}
        </div>
      )}

      {/* Items Table by Category */}
      <div className="space-y-6">
        {groupedItems.map(({ category, items: categoryItems }) => (
          categoryItems.length > 0 && (
            <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 border-b border-gray-200">
                <h3 className="text-white">
                  {category} ({categoryItems.length} items)
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {categoryItems.map((item) => (
                  <div key={item.id}>
                    {/* Show edit form inline if this item is being edited */}
                    {editingId === item.id ? (
                      <div className="p-4">
                        {renderEditForm(item)}
                      </div>
                    ) : (
                      /* Normal item display */
                      <div className="hover:bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <span className="text-gray-900 block mb-2">{item.name}</span>
                            <div className="flex flex-wrap gap-2">
                              {item.sizes.map((sizeData, idx) => (
                                <div
                                  key={idx}
                                  className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-lg border ${
                                    sizeData.stock < 100
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <span className="text-gray-900">{sizeData.size}</span>
                                  <span
                                    className={`${
                                      sizeData.stock < 100 ? 'text-red-600' : 'text-green-600'
                                    }`}
                                  >
                                    Stock: {sizeData.stock}
                                    {sizeData.stock < 100 && ' ⚠️'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit Item"
                            >
                              <Edit2 className="size-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Item"
                            >
                              <Trash2 className="size-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No items found</p>
        </div>
      )}
    </div>
  );
}
