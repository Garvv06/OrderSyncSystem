import { useState, useEffect } from 'react';
import { getOrders, updateOrder, deleteOrder, setAuthToken, getItems, updateItemStock } from '../utils/storage';
import { Order, OrderItem } from '../types';
import { Eye, Trash2, CheckCircle, Clock, Search, X } from 'lucide-react';

interface OrdersListProps {
  filter: 'all' | 'pending';
  token: string;
}

export function OrdersList({ filter, token }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [partyFilter, setPartyFilter] = useState('');
  const [showPartialComplete, setShowPartialComplete] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [partialSelections, setPartialSelections] = useState<{[key: string]: number}>({});
  const [billNumber, setBillNumber] = useState('');

  useEffect(() => {
    loadOrders();
  }, [filter, token]);

  const loadOrders = async () => {
    try {
      setAuthToken(token);
      let allOrders = await getOrders();
      if (filter === 'pending') {
        allOrders = allOrders.filter((order) => order.status === 'Open' || order.status === 'Partially Completed');
      }
      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPartialComplete = (order: Order) => {
    setOrderToComplete(order);
    setShowPartialComplete(true);
    // Initialize partial selections with remaining quantities
    const selections: {[key: string]: number} = {};
    order.items.forEach(item => {
      const remaining = item.quantity - item.completedQuantity;
      selections[item.id] = 0; // Start with 0, user can select amount to complete
    });
    setPartialSelections(selections);
    setBillNumber('');
  };

  const handlePartialComplete = async () => {
    if (!orderToComplete || !billNumber.trim()) {
      alert('Please enter a bill number');
      return;
    }

    // Check if at least one item is selected
    const hasSelection = Object.values(partialSelections).some(qty => qty > 0);
    if (!hasSelection) {
      alert('Please select at least one item to complete');
      return;
    }

    try {
      // Update the order with partial completion
      const updatedItems = orderToComplete.items.map(item => {
        const completingQty = partialSelections[item.id] || 0;
        const newCompletedQty = item.completedQuantity + completingQty;
        
        const billNumbers = item.billNumbers || [];
        if (completingQty > 0) {
          billNumbers.push(billNumber.trim());
        }

        return {
          ...item,
          completedQuantity: newCompletedQty,
          billNumbers,
        };
      });

      // Determine new status
      const allCompleted = updatedItems.every(item => item.completedQuantity >= item.quantity);
      const someCompleted = updatedItems.some(item => item.completedQuantity > 0);
      
      let newStatus: 'Open' | 'Partially Completed' | 'Completed';
      if (allCompleted) {
        newStatus = 'Completed';
      } else if (someCompleted) {
        newStatus = 'Partially Completed';
      } else {
        newStatus = 'Open';
      }

      // Reduce stock for completed items
      const items = await getItems();
      for (const orderItem of updatedItems) {
        const completingQty = partialSelections[orderItem.id] || 0;
        if (completingQty > 0) {
          const item = items.find(i => i.id === orderItem.itemId);
          if (item) {
            const sizeIndex = item.sizes.findIndex(s => s.size === orderItem.size);
            if (sizeIndex !== -1) {
              const newStock = item.sizes[sizeIndex].stock - completingQty;
              await updateItemStock(item.id, orderItem.size, newStock);
            }
          }
        }
      }

      await updateOrder(orderToComplete.id, {
        items: updatedItems,
        status: newStatus,
      });

      await loadOrders();
      setShowPartialComplete(false);
      setOrderToComplete(null);
      setPartialSelections({});
      setBillNumber('');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('Failed to complete order');
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNo: string) => {
    if (confirm(`Delete order ${orderNo}? This action cannot be undone.`)) {
      try {
        await deleteOrder(orderId);
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error('Failed to delete order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const filteredOrders = partyFilter
    ? orders.filter((order) =>
        order.partyName.toLowerCase().includes(partyFilter.toLowerCase())
      )
    : orders;

  const uniqueParties = Array.from(new Set(orders.map((o) => o.partyName)));

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">
          {filter === 'pending' ? '⏳ Remaining Orders' : '📋 All Orders'}
        </h2>
        <p className="text-gray-600">
          {filter === 'pending' ? 'View and manage remaining orders' : 'View all orders'}
        </p>
      </div>

      {/* Party Filter */}
      {filter === 'all' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <label className="block text-gray-700 mb-2">Filter by Party Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              list="party-names"
              placeholder="Search by party name..."
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
            <datalist id="party-names">
              {uniqueParties.map((party, idx) => (
                <option key={idx} value={party} />
              ))}
            </datalist>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
              {filter === 'pending' ? (
                <>
                  <Clock className="size-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No remaining orders</p>
                </>
              ) : (
                <p className="text-gray-500">No orders found</p>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-red-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-gray-900 mb-1">{order.orderNo}</h3>
                    <p className="text-gray-600">Party: {order.partyName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      order.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Partially Completed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-gray-600 mb-3">
                  <p>Date: {new Date(order.orderDate).toLocaleString()}</p>
                  <p>Items: {order.items.length}</p>
                  <p>By: {order.createdByName}</p>
                  {order.status !== 'Open' && (
                    <p className="text-sm mt-1">
                      Progress: {order.items.reduce((sum, item) => sum + item.completedQuantity, 0)} / {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-900">₹{order.total.toFixed(2)}</span>
                  <div className="flex gap-2">
                    {(order.status === 'Open' || order.status === 'Partially Completed') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowPartialComplete(order);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Complete Items"
                      >
                        <CheckCircle className="size-5" />
                      </button>
                    )}
                    {(order.status === 'Open' || order.status === 'Partially Completed') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id, order.orderNo);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Order"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    )}
                    {order.status === 'Completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id, order.orderNo);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Order"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Details */}
        <div className="lg:sticky lg:top-6">
          {selectedOrder ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600">Order Number</p>
                  <p className="text-gray-900">{selectedOrder.orderNo}</p>
                </div>
                <div>
                  <p className="text-gray-600">Party Name</p>
                  <p className="text-gray-900">{selectedOrder.partyName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.orderDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Created By</p>
                  <p className="text-gray-900">{selectedOrder.createdByName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full ${
                      selectedOrder.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedOrder.status === 'Partially Completed'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => {
                    const remaining = item.quantity - item.completedQuantity;
                    return (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-900">
                          {index + 1}. {item.itemName} - {item.size}
                        </p>
                        <p className="text-gray-600">
                          Qty: {item.quantity} × ₹{item.price} = ₹{item.lineTotal.toFixed(2)}
                        </p>
                        {item.completedQuantity > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-green-600">
                              ✓ Completed: {item.completedQuantity} units
                            </p>
                            {remaining > 0 && (
                              <p className="text-orange-600">
                                ⏳ Remaining: {remaining} units
                              </p>
                            )}
                            {item.billNumbers && item.billNumbers.length > 0 && (
                              <p className="text-gray-600 text-sm">
                                Bills: {item.billNumbers.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                        {item.completedQuantity === 0 && (
                          <p className="text-orange-600 mt-1">
                            ⏳ Pending: {item.quantity} units
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">
                    ₹{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
              <Eye className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Partial Complete Modal */}
      {showPartialComplete && orderToComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-gray-900 mb-2">Complete Items - {orderToComplete.orderNo}</h3>
            <p className="text-gray-600 mb-4">Party: <strong>{orderToComplete.partyName}</strong></p>
            
            {/* Show Previous Bills */}
            {orderToComplete.items.some(item => item.billNumbers && item.billNumbers.length > 0) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <h4 className="text-gray-900 mb-2">📄 Previous Bills for this Order:</h4>
                <div className="space-y-1">
                  {Array.from(new Set(orderToComplete.items.flatMap(item => item.billNumbers || []))).map((bill, idx) => (
                    <p key={idx} className="text-gray-700">• {bill}</p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Select which items/sizes to complete and enter quantities:
            </p>

            <div className="space-y-3 mb-6">
              {orderToComplete.items.map((item) => {
                const remaining = item.quantity - item.completedQuantity;
                if (remaining <= 0) return null;

                return (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 mb-1">
                      {item.itemName} - {item.size}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Remaining: {remaining} units (₹{item.price}/unit)
                    </p>
                    {item.completedQuantity > 0 && (
                      <p className="text-green-600 mb-2 text-sm">
                        ✓ Previously Completed: {item.completedQuantity} units
                        {item.billNumbers && item.billNumbers.length > 0 && ` (Bills: ${item.billNumbers.join(', ')})`}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="text-gray-700">Complete Qty:</label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={partialSelections[item.id] === 0 ? '' : partialSelections[item.id]}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                          setPartialSelections({
                            ...partialSelections,
                            [item.id]: Math.min(val, remaining),
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                      />
                      <button
                        onClick={() => {
                          setPartialSelections({
                            ...partialSelections,
                            [item.id]: remaining,
                          });
                        }}
                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        All
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Bill Number (Alphanumeric) *</label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., BILL-001, INV2024-123"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePartialComplete}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Complete Selected Items
              </button>
              <button
                onClick={() => {
                  setShowPartialComplete(false);
                  setOrderToComplete(null);
                  setPartialSelections({});
                  setBillNumber('');
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}