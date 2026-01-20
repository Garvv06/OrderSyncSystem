import { useState, useEffect } from 'react';
import { getItems, addOrder, setAuthToken } from '../utils/storage';
import { Item, OrderItem, ItemCategory } from '../types';
import { ShoppingCart, ShoppingBag, Plus, Trash2, Save } from 'lucide-react';

interface CreateOrderProps {
  token: string;
  adminName: string;
  adminEmail: string;
  orderType: 'purchase' | 'sale';
  onOrderCreated: () => void;
}

export function CreateOrder({ token, adminName, adminEmail, orderType, onOrderCreated }: CreateOrderProps) {
  // All items from database
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Party/Customer name
  const [partyName, setPartyName] = useState('');

  // Current selection state - simple and flat
  const [currentCategory, setCurrentCategory] = useState<ItemCategory | ''>('');
  const [currentItemID, setCurrentItemID] = useState('');
  const [sizeRows, setSizeRows] = useState<Array<{ size: string; qty: number; price: number }>>([]);

  // Shopping cart
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  const CATEGORIES: ItemCategory[] = [
    'Nut',
    'Bolts',
    'Fasteners',
    'Screw',
    'Scapfolding Items',
    'Washer',
    'Hand Tools',
  ];

  useEffect(() => {
    loadAllItems();
  }, [token]);

  const loadAllItems = async () => {
    try {
      setAuthToken(token);
      const items = await getItems();
      setAllItems(items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get items for currently selected category
  const getCategoryItems = (): Item[] => {
    if (!currentCategory) return [];
    return allItems.filter((item) => item.category === currentCategory);
  };

  // Get currently selected item object
  const getCurrentItem = (): Item | undefined => {
    if (!currentItemID) return undefined;
    return allItems.find((item) => item.id === currentItemID);
  };

  // Handle category button click
  const selectCategory = (cat: ItemCategory) => {
    setCurrentCategory(cat);
    setCurrentItemID('');
    setSizeRows([]);
  };

  // Handle item button click
  const selectItem = (itemID: string) => {
    setCurrentItemID(itemID);
    setSizeRows([]);
  };

  // Add a new size row
  const addSizeRow = () => {
    setSizeRows([...sizeRows, { size: '', qty: 0, price: 0 }]);
  };

  // Remove a size row
  const removeSizeRow = (idx: number) => {
    setSizeRows(sizeRows.filter((_, i) => i !== idx));
  };

  // Update a size row
  const updateSizeRow = (idx: number, field: 'size' | 'qty' | 'price', value: any) => {
    const updated = [...sizeRows];
    updated[idx] = { ...updated[idx], [field]: value };
    setSizeRows(updated);
  };

  // Add items to cart
  const addToCart = () => {
    const item = getCurrentItem();
    if (!item) {
      alert('Please select an item');
      return;
    }

    if (sizeRows.length === 0) {
      alert('Please add at least one size');
      return;
    }

    // Validate rows
    const validRows = sizeRows.filter((row) => row.size && row.qty > 0 && row.price > 0);
    if (validRows.length === 0) {
      alert('Please enter valid size, quantity, and price');
      return;
    }

    // Check stock
    for (const row of validRows) {
      const sizeInfo = item.sizes.find((s) => s.size === row.size);
      if (!sizeInfo) {
        alert(`Size ${row.size} not available`);
        return;
      }
      if (sizeInfo.stock < row.qty) {
        alert(`Insufficient stock for ${item.name} - ${row.size}. Available: ${sizeInfo.stock}`);
        return;
      }
    }

    // Create cart items
    const newCartItems: OrderItem[] = validRows.map((row) => ({
      id: `CART_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      itemId: item.id,
      itemName: item.name,
      size: row.size,
      quantity: row.qty,
      completedQuantity: 0,
      price: row.price,
      lineTotal: row.qty * row.price,
      billNumbers: [],
    }));

    setCartItems([...cartItems, ...newCartItems]);

    // Reset selection
    setCurrentCategory('');
    setCurrentItemID('');
    setSizeRows([]);

    alert(`✅ ${newCartItems.length} item(s) added to cart`);
  };

  // Remove from cart
  const removeFromCart = (cartID: string) => {
    setCartItems(cartItems.filter((item) => item.id !== cartID));
  };

  // Submit order
  const submitOrder = async () => {
    if (!partyName.trim()) {
      alert('Please enter ' + (orderType === 'purchase' ? 'party' : 'customer') + ' name');
      return;
    }

    if (cartItems.length === 0) {
      alert('Please add items to cart');
      return;
    }

    try {
      const total = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

      await addOrder({
        orderDate: new Date().toISOString(),
        partyName: partyName.trim(),
        items: cartItems,
        total,
        status: 'Open',
        createdBy: adminEmail,
        createdByName: adminName,
        orderType,
      });

      alert(`✅ ${orderType === 'purchase' ? 'Purchase' : 'Sale'} order created successfully!`);

      // Reset everything
      setPartyName('');
      setCurrentCategory('');
      setCurrentItemID('');
      setSizeRows([]);
      setCartItems([]);

      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Failed to create order');
    }
  };

  // Cancel
  const cancelOrder = () => {
    if (confirm('Cancel order? All data will be lost.')) {
      setPartyName('');
      setCurrentCategory('');
      setCurrentItemID('');
      setSizeRows([]);
      setCartItems([]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const categoryItems = getCategoryItems();
  const selectedItem = getCurrentItem();
  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const Icon = orderType === 'purchase' ? ShoppingCart : ShoppingBag;
  const themeColor = orderType === 'purchase' ? 'blue' : 'green';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">
          {Icon && <Icon className="inline size-6 mr-2" />}
          Create {orderType === 'purchase' ? 'Purchase' : 'Sale'} Order
        </h2>
        <p className="text-gray-600">Add items to cart and submit your order</p>
      </div>

      {/* Party/Customer Name */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-gray-900 mb-4">
          {orderType === 'purchase' ? 'Party/Vendor Name' : 'Customer Name'}
        </h3>
        <input
          type="text"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder={`Enter ${orderType === 'purchase' ? 'party/vendor' : 'customer'} name`}
        />
      </div>

      {/* Step 1: Select Category */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
        <h3 className="text-gray-900 mb-4 font-semibold text-lg">1️⃣ Select Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const isThisCategorySelected = currentCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => selectCategory(cat)}
                className={`p-4 rounded-lg border-2 transition-all font-medium ${
                  isThisCategorySelected
                    ? `border-${themeColor}-600 bg-${themeColor}-600 text-white shadow-lg transform scale-105`
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Item (only show if category selected) */}
      {currentCategory && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md">
          <h3 className="text-gray-900 mb-4 font-semibold text-lg">
            2️⃣ Select Item from "<span className={`text-${themeColor}-600`}>{currentCategory}</span>"
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {categoryItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items in this category</p>
            ) : (
              categoryItems.map((item) => {
                const isThisItemSelected = currentItemID === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      isThisItemSelected
                        ? `border-${themeColor}-600 bg-${themeColor}-100 shadow-lg`
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className={`font-semibold text-lg ${isThisItemSelected ? `text-${themeColor}-900` : 'text-gray-900'}`}>{item.name}</p>
                      {isThisItemSelected && (
                        <span className={`bg-${themeColor}-600 text-white px-4 py-1.5 rounded-full text-sm font-bold`}>✓ SELECTED</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.sizes.map((sz) => (
                        <span key={`${item.id}_${sz.size}`} className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                          isThisItemSelected 
                            ? `bg-${themeColor}-200 text-${themeColor}-900 border border-${themeColor}-300` 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {sz.size} • Stock: {sz.stock}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Step 3: Add Sizes (only show if item selected) */}
      {selectedItem && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">3. Add Sizes & Quantities for "{selectedItem.name}"</h3>
            <button
              type="button"
              onClick={addSizeRow}
              className={`bg-${themeColor}-600 text-white px-4 py-2 rounded-lg hover:bg-${themeColor}-700 flex items-center gap-2`}
            >
              <Plus className="size-4" />
              Add Size
            </button>
          </div>

          {sizeRows.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Click "Add Size" button to add sizes
            </div>
          ) : (
            <div className="space-y-3">
              {sizeRows.map((row, idx) => (
                <div key={`row${idx}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Size *</label>
                      <select
                        value={row.size}
                        onChange={(e) => updateSizeRow(idx, 'size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Size</option>
                        {selectedItem.sizes.map((sz) => (
                          <option key={`${selectedItem.id}_opt_${sz.size}`} value={sz.size}>
                            {sz.size} (Stock: {sz.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={row.qty || ''}
                        onChange={(e) => updateSizeRow(idx, 'qty', parseInt(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.price || ''}
                        onChange={(e) => updateSizeRow(idx, 'price', parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Price"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeSizeRow(idx)}
                        className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={addToCart}
              className={`bg-${themeColor}-600 text-white px-6 py-3 rounded-lg hover:bg-${themeColor}-700 flex items-center gap-2`}
            >
              {Icon && <Icon className="size-5" />}
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Shopping Cart */}
      {cartItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Shopping Cart ({cartItems.length} items)</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-700">Item</th>
                  <th className="px-4 py-2 text-left text-gray-700">Size</th>
                  <th className="px-4 py-2 text-right text-gray-700">Qty</th>
                  <th className="px-4 py-2 text-right text-gray-700">Price</th>
                  <th className="px-4 py-2 text-right text-gray-700">Total</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3 text-gray-900">{item.itemName}</td>
                    <td className="px-4 py-3 text-gray-700">{item.size}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">₹{item.lineTotal.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                    Grand Total:
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ₹{cartTotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelOrder}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Cancel Order
            </button>
            <button
              type="button"
              onClick={submitOrder}
              className={`bg-${themeColor}-600 text-white px-6 py-3 rounded-lg hover:bg-${themeColor}-700 flex items-center gap-2`}
            >
              <Save className="size-5" />
              Submit {orderType === 'purchase' ? 'Purchase' : 'Sale'} Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}