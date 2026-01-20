import { useState, useEffect } from 'react';
import { getItems, updateItem, addItem, setAuthToken } from '../utils/storage';
import { Item, ItemCategory } from '../types';
import { Package, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface ItemsListProps {
  token: string;
}

export function ItemsList({ token }: ItemsListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingStocks, setEditingStocks] = useState<Array<{ size: string; stock: number }>>([]);
  
  // Add new item modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Nut');
  const [customCategory, setCustomCategory] = useState('');
  const [newItemSizes, setNewItemSizes] = useState<Array<{ size: string; stock: number }>>([{ size: '', stock: 0 }]);

  const [categories, setCategories] = useState<ItemCategory[]>([
    'Nut',
    'Bolts',
    'Fasteners',
    'Screw',
    'Scapfolding Items',
    'Washer',
    'Hand Tools',
  ]);

  useEffect(() => {
    loadItems();
  }, [token]);

  const loadItems = async () => {
    try {
      setAuthToken(token);
      const itemsData = await getItems();
      setItems(itemsData);
      
      // Extract unique categories from items
      const uniqueCategories = new Set<string>(itemsData.map(item => item.category));
      const allCategories = Array.from(uniqueCategories) as ItemCategory[];
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: Item) => {
    setEditingItem(item.id);
    setEditingStocks(item.sizes.map(sz => ({ size: sz.size, stock: sz.stock })));
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingStocks([]);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    
    const item = items.find(i => i.id === editingItem);
    if (!item) return;

    const validSizes = editingStocks.filter(s => s.size.trim() !== '');
    if (validSizes.length === 0) {
      alert('Please add at least one size');
      return;
    }

    try {
      await updateItem(editingItem, {
        sizes: validSizes.map(s => ({ size: s.size.trim(), stock: s.stock })),
      });
      alert('✅ Item updated successfully!');
      setEditingItem(null);
      setEditingStocks([]);
      await loadItems();
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('❌ Failed to update item');
    }
  };

  const updateEditingSize = (index: number, field: 'size' | 'stock', value: any) => {
    const updated = [...editingStocks];
    updated[index] = { ...updated[index], [field]: value };
    setEditingStocks(updated);
  };

  const addEditingSizeRow = () => {
    setEditingStocks([...editingStocks, { size: '', stock: 0 }]);
  };

  const removeEditingSizeRow = (index: number) => {
    if (editingStocks.length <= 1) {
      alert('Item must have at least one size');
      return;
    }
    setEditingStocks(editingStocks.filter((_, i) => i !== index));
  };

  // Add new item functions
  const openAddModal = () => {
    setShowAddModal(true);
    setNewItemName('');
    setNewItemCategory(categories[0] || 'Nut');
    setCustomCategory('');
    setNewItemSizes([{ size: '', stock: 0 }]);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewItemName('');
    setNewItemCategory(categories[0] || 'Nut');
    setCustomCategory('');
    setNewItemSizes([{ size: '', stock: 0 }]);
  };

  const addNewSizeRow = () => {
    setNewItemSizes([...newItemSizes, { size: '', stock: 0 }]);
  };

  const removeNewSizeRow = (index: number) => {
    if (newItemSizes.length <= 1) {
      alert('Item must have at least one size');
      return;
    }
    setNewItemSizes(newItemSizes.filter((_, i) => i !== index));
  };

  const updateNewSize = (index: number, field: 'size' | 'stock', value: any) => {
    const updated = [...newItemSizes];
    updated[index] = { ...updated[index], [field]: value };
    setNewItemSizes(updated);
  };

  const saveNewItem = async () => {
    if (!newItemName.trim()) {
      alert('Please enter item name');
      return;
    }

    const finalCategory = customCategory.trim() || newItemCategory;
    if (!finalCategory) {
      alert('Please select or enter a category');
      return;
    }

    const validSizes = newItemSizes.filter(s => s.size.trim() !== '');
    if (validSizes.length === 0) {
      alert('Please add at least one size');
      return;
    }

    try {
      await addItem({
        name: newItemName.trim(),
        category: finalCategory as ItemCategory,
        sizes: validSizes.map(s => ({ size: s.size.trim(), stock: s.stock })),
      });

      alert('✅ Item added successfully!');
      closeAddModal();
      await loadItems();
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('❌ Failed to add item');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading items...</p>
      </div>
    );
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 mb-2 font-semibold text-xl">
              <Package className="inline size-6 mr-2" />
              Item Inventory
            </h2>
            <p className="text-gray-600">Manage stock levels for all items ({items.length} items across {Object.keys(groupedItems).length} categories)</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-md transition-colors"
          >
            <Plus className="size-5" />
            Add New Item
          </button>
        </div>

        {/* Display items grouped by category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b)).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
                <h3 className="text-white font-bold text-lg">
                  {category} ({categoryItems.length} items)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Item Name</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Sizes & Stock</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                          {editingItem === item.id ? (
                            <div className="space-y-2">
                              {editingStocks.map((sz, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={sz.size}
                                    onChange={(e) => updateEditingSize(index, 'size', e.target.value)}
                                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Size"
                                  />
                                  <span className="text-gray-600">:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={sz.stock || ''}
                                    onChange={(e) => updateEditingSize(index, 'stock', parseInt(e.target.value) || 0)}
                                    onFocus={(e) => e.target.select()}
                                    className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Stock"
                                  />
                                  <button
                                    onClick={() => removeEditingSizeRow(index)}
                                    className="bg-red-500 text-white px-2 py-2 rounded-lg hover:bg-red-600"
                                    title="Remove size"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={addEditingSizeRow}
                                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1 text-sm"
                              >
                                <Plus className="size-4" />
                                Add Size
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {item.sizes.map((sz) => (
                                <span
                                  key={`${item.id}_${sz.size}`}
                                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                    sz.stock < 50
                                      ? 'bg-red-100 text-red-700 border border-red-300'
                                      : sz.stock < 100
                                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                      : 'bg-green-100 text-green-700 border border-green-300'
                                  }`}
                                >
                                  {sz.size}: {sz.stock}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === item.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1 font-medium transition-colors"
                              >
                                <Save className="size-4" />
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-1 font-medium transition-colors"
                              >
                                <X className="size-4" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(item)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 font-medium transition-colors"
                            >
                              <Edit2 className="size-4" />
                              Edit Sizes & Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Add New Item</h3>
              <button onClick={closeAddModal} className="text-white hover:text-red-400 transition-colors">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter item name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Category *</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Or enter new category name"
                />
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-gray-700 font-semibold">Sizes & Stock *</label>
                  <button
                    onClick={addNewSizeRow}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm font-medium"
                  >
                    <Plus className="size-4" />
                    Add Size
                  </button>
                </div>
                <div className="space-y-3">
                  {newItemSizes.map((sizeRow, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={sizeRow.size}
                        onChange={(e) => updateNewSize(index, 'size', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Size (e.g., M8, 10mm)"
                      />
                      <input
                        type="number"
                        min="0"
                        value={sizeRow.stock || ''}
                        onChange={(e) => updateNewSize(index, 'stock', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-32 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Stock"
                      />
                      {newItemSizes.length > 1 && (
                        <button
                          onClick={() => removeNewSizeRow(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2">
                <button
                  onClick={closeAddModal}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewItem}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="size-5" />
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
