import { useState, useEffect } from 'react';
import { getItems, addOrder, setAuthToken, getNextOrderNumber } from '../utils/storage';
import { Item, OrderItem, ItemCategory } from '../types';
import { ShoppingCart, Plus, Trash2, Save } from 'lucide-react';

interface NewOrderProps {
  token: string;
  adminName: string;
  adminEmail: string;
  onOrderCreated: () => void;
}

export function NewOrder({ token, adminName, adminEmail, onOrderCreated }: NewOrderProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Step-by-step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [partyName, setPartyName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<{size: string; quantity: number; price: number}[]>([]);
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

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

  const handleStep1Next = () => {
    if (!partyName.trim()) {
      alert('Please enter party name');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!selectedItemId) {
      alert('Please select an item');
      return;
    }
    setStep(4);
  };

  const handleAddSizeSelection = () => {
    setSelectedSizes([...selectedSizes, { size: '', quantity: 0, price: 0 }]);
  };

  const handleRemoveSizeSelection = (index: number) => {
    setSelectedSizes(selectedSizes.filter((_, i) => i !== index));
  };

  const handleSizeSelectionChange = (index: number, field: 'size' | 'quantity' | 'price', value: string | number) => {
    const newSelections = [...selectedSizes];
    newSelections[index] = { ...newSelections[index], [field]: value };
    setSelectedSizes(newSelections);
  };

  const handleAddToOrder = () => {
    if (selectedSizes.length === 0) {
      alert('Please add at least one size');
      return;
    }

    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;

    const validSelections = selectedSizes.filter(s => s.size && s.quantity > 0 && s.price > 0);
    
    if (validSelections.length === 0) {
      alert('Please enter valid size, quantity and price for at least one size');
      return;
    }

    // Check stock availability
    for (const selection of validSelections) {
      const sizeData = item.sizes.find(s => s.size === selection.size);
      if (!sizeData) {
        alert(`Size ${selection.size} not found`);
        return;
      }
      if (sizeData.stock < selection.quantity) {
        alert(`Insufficient stock for ${item.name} - ${selection.size}. Available: ${sizeData.stock}`);
        return;
      }
    }

    // Add each size as a separate order item
    const newItems: OrderItem[] = validSelections.map(selection => ({
      id: `${Date.now()}_${selectedItemId}_${selection.size}_${Math.random()}`,
      itemId: selectedItemId,
      itemName: item.name,
      size: selection.size,
      quantity: selection.quantity,
      completedQuantity: 0,
      price: selection.price,
      lineTotal: selection.quantity * selection.price,
      billNumbers: [],
    }));

    setOrderItems([...orderItems, ...newItems]);
    
    // Reset for next item
    setSelectedCategory('');
    setSelectedItemId('');
    setSelectedSizes([]);
    setStep(2);
  };

  const handleRemoveOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    try {
      const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
      
      await addOrder({
        orderDate: new Date().toISOString(),
        partyName,
        items: orderItems,
        total,
        status: 'Open',
        createdBy: adminEmail,
        createdByName: adminName,
      });

      alert('Order created successfully!');
      
      // Reset form
      setPartyName('');
      setSelectedCategory('');
      setSelectedItemId('');
      setSelectedSizes([]);
      setOrderItems([]);
      setStep(1);
      
      onOrderCreated();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order');
    }
  };

  const handleCancel = () => {
    if (confirm('Cancel order creation? All data will be lost.')) {
      setPartyName('');
      setSelectedCategory('');
      setSelectedItemId('');
      setSelectedSizes([]);
      setOrderItems([]);
      setStep(1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : [];

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">➕ Create New Order</h2>
        <p className="text-gray-600">5-Step workflow to place an order</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`size-8 rounded-full mx-auto mb-1 flex items-center justify-center ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>1</div>
            <p className="text-sm">Party Name</p>
          </div>
          <div className={`flex-1 border-t-2 ${step >= 2 ? 'border-red-600' : 'border-gray-200'}`} />
          <div className={`flex-1 text-center ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`size-8 rounded-full mx-auto mb-1 flex items-center justify-center ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>2</div>
            <p className="text-sm">Category</p>
          </div>
          <div className={`flex-1 border-t-2 ${step >= 3 ? 'border-red-600' : 'border-gray-200'}`} />
          <div className={`flex-1 text-center ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`size-8 rounded-full mx-auto mb-1 flex items-center justify-center ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>3</div>
            <p className="text-sm">Item</p>
          </div>
          <div className={`flex-1 border-t-2 ${step >= 4 ? 'border-red-600' : 'border-gray-200'}`} />
          <div className={`flex-1 text-center ${step >= 4 ? 'text-red-600' : 'text-gray-400'}`}>
            <div className={`size-8 rounded-full mx-auto mb-1 flex items-center justify-center ${step >= 4 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>4</div>
            <p className="text-sm">Sizes & Qty</p>
          </div>
        </div>
      </div>

      {/* Step 1: Party Name */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Step 1: Enter Party Name</h3>
          <input
            type="text"
            placeholder="Enter party/customer name"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
          />
          <button
            onClick={handleStep1Next}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Next: Select Category →
          </button>
        </div>
      )}

      {/* Step 2: Category Selection */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Step 2: Select Category</h3>
          <p className="text-gray-600 mb-4">Party: <strong>{partyName}</strong></p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === cat
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleStep2Next}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Next: Select Item →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Item Selection */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Step 3: Select Item</h3>
          <p className="text-gray-600 mb-4">
            Party: <strong>{partyName}</strong> | Category: <strong>{selectedCategory}</strong>
          </p>
          <div className="space-y-2 mb-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedItemId === item.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-gray-900 mb-2">{item.name}</p>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((sizeData, idx) => (
                    <span key={`${item.id}-size-${idx}-${sizeData.size}`} className="text-sm px-2 py-1 bg-gray-100 rounded">
                      {sizeData.size} (Stock: {sizeData.stock})
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleStep3Next}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              Next: Select Sizes →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Multiple Size Selection */}
      {step === 4 && selectedItem && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-900 mb-4">Step 4: Select Sizes & Quantities</h3>
          <p className="text-gray-600 mb-4">
            Party: <strong>{partyName}</strong> | Item: <strong>{selectedItem.name}</strong>
          </p>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-700">Add Sizes</label>
              <button
                onClick={handleAddSizeSelection}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="size-4" />
                Add Size
              </button>
            </div>

            {selectedSizes.length === 0 && (
              <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500 mb-4">
                Click "Add Size" to select sizes and quantities
              </div>
            )}

            <div className="space-y-3">
              {selectedSizes.map((selection, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Size *</label>
                      <select
                        value={selection.size}
                        onChange={(e) => handleSizeSelectionChange(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select Size</option>
                        {selectedItem.sizes.map((sizeData, idx) => (
                          <option key={idx} value={sizeData.size}>
                            {sizeData.size} (Stock: {sizeData.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={selection.quantity === 0 ? '' : selection.quantity}
                        onChange={(e) => handleSizeSelectionChange(index, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter qty"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={selection.price === 0 ? '' : selection.price}
                        onChange={(e) => handleSizeSelectionChange(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter price"
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveSizeSelection(index)}
                        className="w-full bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                  {selection.size && selection.quantity > 0 && selection.price > 0 && (
                    <p className="mt-2 text-gray-600 text-sm">
                      Line Total: ₹{(selection.quantity * selection.price).toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep(3);
                setSelectedSizes([]);
              }}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleAddToOrder}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="size-4" />
              Add to Order
            </button>
          </div>
        </div>
      )}

      {/* Order Summary */}
      {orderItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg border-2 border-red-600">
          <h3 className="text-gray-900 mb-4">📋 Order Summary</h3>
          <p className="text-gray-600 mb-4">Party: <strong>{partyName}</strong></p>

          <div className="space-y-2 mb-4">
            {orderItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-gray-900">
                    {index + 1}. {item.itemName} - {item.size}
                  </p>
                  <p className="text-gray-600">
                    {item.quantity} × ₹{item.price} = ₹{item.lineTotal.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveOrderItem(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-gray-900">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            >
              Cancel Order
            </button>
            <button
              onClick={handleSubmitOrder}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Save className="size-5" />
              Submit Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}