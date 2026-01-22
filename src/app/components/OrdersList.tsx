import { useState, useEffect, useRef } from 'react';
import { getOrders, updateOrder, updateItemStock, getItems, deleteOrder, insertOrder } from '../utils/storage';
import { Order, Item, OrderItem } from '../types';
import { FileText, CheckCircle, Clock, Package, X, Download, Upload, Trash2 } from 'lucide-react';

interface OrdersListProps {
  filter: 'all' | 'pending';
  orderType: 'purchase' | 'sale';
}

export function OrdersList({ filter, orderType }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Partial completion modal state
  const [completingOrder, setCompletingOrder] = useState<Order | null>(null);
  const [billNumber, setBillNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [itemId: string]: number }>({});

  useEffect(() => {
    loadData();
  }, [orderType]);

  const loadData = async () => {
    try {
      const [ordersData, itemsData] = await Promise.all([getOrders(), getItems()]);
      setOrders(ordersData);
      setItems(itemsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const openCompletionModal = (order: Order) => {
    setCompletingOrder(order);
    setBillNumber('');
    setSelectedItems({});
  };

  const closeCompletionModal = () => {
    setCompletingOrder(null);
    setBillNumber('');
    setSelectedItems({});
  };

  const updateSelectedQuantity = (itemId: string, quantity: number) => {
    const orderItem = completingOrder?.items.find(i => i.id === itemId);
    if (!orderItem) return;

    const remainingQty = orderItem.quantity - orderItem.completedQuantity;
    const validQty = Math.min(Math.max(0, quantity), remainingQty);

    if (validQty === 0) {
      const newSelected = { ...selectedItems };
      delete newSelected[itemId];
      setSelectedItems(newSelected);
    } else {
      setSelectedItems({ ...selectedItems, [itemId]: validQty });
    }
  };

  const completeOrderPartially = async () => {
    if (!completingOrder) return;
    
    if (!billNumber.trim()) {
      alert('Please enter bill number');
      return;
    }

    const itemsToComplete = Object.keys(selectedItems);
    if (itemsToComplete.length === 0) {
      alert('Please select items to complete');
      return;
    }

    try {
      // Update stock for each completed item
      for (const itemId of itemsToComplete) {
        const orderItem = completingOrder.items.find(i => i.id === itemId);
        if (!orderItem) continue;

        const item = items.find(i => i.id === orderItem.itemId);
        if (!item) continue;

        const completedQty = selectedItems[itemId];
        
        // Calculate new stock
        const newStocks: { [size: string]: number } = {};
        item.sizes.forEach((sz) => {
          if (sz.size === orderItem.size) {
            // For PURCHASE orders, ADD stock. For SALE orders, SUBTRACT stock
            const stockChange = orderType === 'purchase' ? completedQty : -completedQty;
            newStocks[sz.size] = Math.max(0, sz.stock + stockChange);
          } else {
            newStocks[sz.size] = sz.stock;
          }
        });

        await updateItemStock(item.id, newStocks);
      }

      // Update order items with completed quantities and bill numbers
      const updatedItems = completingOrder.items.map(orderItem => {
        if (selectedItems[orderItem.id]) {
          return {
            ...orderItem,
            completedQuantity: orderItem.completedQuantity + selectedItems[orderItem.id],
            billNumbers: [...orderItem.billNumbers, billNumber.trim()],
          };
        }
        return orderItem;
      });

      // Check if all items are fully completed
      const allCompleted = updatedItems.every(item => item.completedQuantity >= item.quantity);
      const someCompleted = updatedItems.some(item => item.completedQuantity > 0);
      
      const newStatus = allCompleted ? 'Completed' : someCompleted ? 'Partially Completed' : 'Open';

      // Update order (NO AUTO CSV EXPORT)
      await updateOrder(completingOrder.id, {
        items: updatedItems,
        status: newStatus,
      });

      if (allCompleted) {
        alert('✅ Order completed successfully!');
      } else {
        alert(`✅ Order partially completed with bill #${billNumber}`);
      }

      closeCompletionModal();
      await loadData();
    } catch (error) {
      console.error('Failed to complete order:', error);
      alert('❌ Failed to complete order');
    }
  };

  // Export selected orders or all orders to CSV
  const exportToCSV = () => {
    const ordersToExport = selectedOrders.size > 0
      ? filteredOrders.filter(o => selectedOrders.has(o.id))
      : filteredOrders;

    if (ordersToExport.length === 0) {
      alert('❌ No orders to export');
      return;
    }

    // Create CSV content
    let csvContent = 'Order No,Party Name,Order Date,Status,Order Type,Item Name,Size,Quantity,Completed Qty,Remaining Qty,Price,Line Total,Bill Numbers\n';

    ordersToExport.forEach(order => {
      order.items.forEach(item => {
        const remaining = item.quantity - item.completedQuantity;
        const bills = item.billNumbers.join(';');
        csvContent += `"${order.orderNo}","${order.partyName}","${new Date(order.orderDate).toLocaleDateString()}","${order.status}","${order.orderType}","${item.itemName}","${item.size}",${item.quantity},${item.completedQuantity},${remaining},${item.price},${item.lineTotal},"${bills}"\n`;
      });
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${orderType}_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Exported ${ordersToExport.length} order(s) to CSV`);
  };

  // Import orders from CSV
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          alert('❌ CSV file is empty');
          return;
        }

        // Helper function to parse CSV line properly
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          
          result.push(current.trim());
          return result;
        };

        // Parse CSV
        const headers = parseCSVLine(lines[0]);
        console.log('CSV Headers:', headers);
        
        const ordersMap = new Map<string, any>();

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          
          console.log(`Row ${i}:`, values);
          
          if (values.length < 8) {
            console.warn(`Row ${i}: Insufficient columns (${values.length}), skipping`);
            continue;
          }

          const orderNo = values[0];
          const partyName = values[1];
          const orderDate = values[2];
          const status = values[3];
          const importedOrderType = values[4].toLowerCase();
          const itemName = values[5];
          const size = values[6];
          const quantity = parseInt(values[7]) || 0;
          const completedQty = parseInt(values[8]) || 0;
          const price = parseFloat(values[10]) || 0;
          const bills = values[12] ? values[12].split(';').map(b => b.trim()).filter(b => b) : [];

          console.log(`Searching for item: "${itemName}" with size: "${size}"`);

          // Find matching item
          const matchingItem = items.find(item => 
            item.name.toLowerCase() === itemName.toLowerCase() &&
            item.sizes.some(s => s.size === size)
          );

          if (!matchingItem) {
            console.warn(`Item not found: ${itemName} (${size})`);
            alert(`⚠️ Item not found: "${itemName}" with size "${size}"\n\nPlease check:\n1. Item name matches exactly (case-insensitive)\n2. Size matches exactly (case-sensitive)\n3. Item exists in your Items tab\n\nRow ${i} will be skipped.`);
            continue;
          }

          if (!ordersMap.has(orderNo)) {
            ordersMap.set(orderNo, {
              orderNo,
              partyName,
              orderDate: new Date(orderDate).toISOString(),
              status,
              orderType: importedOrderType,
              items: [],
            });
          }

          const order = ordersMap.get(orderNo);
          order.items.push({
            id: `${Date.now()}_${Math.random()}`,
            itemId: matchingItem.id,
            itemName: matchingItem.name,
            size,
            quantity,
            completedQuantity: completedQty,
            price,
            lineTotal: quantity * price,
            billNumbers: bills,
          });
        }

        if (ordersMap.size === 0) {
          alert('❌ No valid orders found in CSV. Please check the format and item names.');
          return;
        }

        // Import orders
        let imported = 0;
        for (const orderData of ordersMap.values()) {
          const total = orderData.items.reduce((sum: number, item: any) => sum + item.lineTotal, 0);
          
          const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderNo: orderData.orderNo,
            partyName: orderData.partyName,
            orderDate: orderData.orderDate,
            status: orderData.status,
            orderType: orderData.orderType,
            items: orderData.items,
            total,
            createdBy: 'Import',
            createdByEmail: 'import@system.com',
          };

          await insertOrder(newOrder);
          imported++;
        }

        alert(`✅ Successfully imported ${imported} order(s)`);
        await loadData();
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Failed to import CSV. Please check the format.');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Toggle order selection
  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Select all orders
  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  // Delete selected orders
  const deleteSelectedOrders = async () => {
    if (selectedOrders.size === 0) {
      alert('❌ No orders selected');
      return;
    }

    const confirmed = confirm(`⚠️ Are you sure you want to delete ${selectedOrders.size} order(s)? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      for (const orderId of selectedOrders) {
        await deleteOrder(orderId);
      }

      alert(`✅ Deleted ${selectedOrders.size} order(s)`);
      setSelectedOrders(new Set());
      await loadData();
    } catch (error) {
      console.error('Failed to delete orders:', error);
      alert('❌ Failed to delete orders');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  const filteredOrders = orders
    .filter((o) => o.orderType === orderType)
    .filter((o) => filter === 'all' || o.status === 'Open' || o.status === 'Partially Completed');

  if (filteredOrders.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <FileText className="size-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No {filter === 'pending' ? 'pending' : ''} {orderType} orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Actions */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-gray-900 mb-1 font-semibold text-xl">
                {filter === 'pending' ? (
                  <>
                    <Clock className="inline size-6 mr-2" />
                    Pending {orderType === 'purchase' ? 'Purchase' : 'Sale'} Orders
                  </>
                ) : (
                  <>
                    <FileText className="inline size-6 mr-2" />
                    All {orderType === 'purchase' ? 'Purchase' : 'Sale'} Orders
                  </>
                )}
              </h2>
              <p className="text-gray-600">{filteredOrders.length} orders found • {selectedOrders.size} selected</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Export CSV Button */}
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md"
              >
                <Download className="size-5" />
                Export to CSV
              </button>

              {/* Import CSV Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md"
              >
                <Upload className="size-5" />
                Import CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />

              {/* Delete Selected Button */}
              <button
                onClick={deleteSelectedOrders}
                disabled={selectedOrders.size === 0}
                className={`${
                  selectedOrders.size === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-md`}
              >
                <Trash2 className="size-5" />
                Delete Selected ({selectedOrders.size})
              </button>
            </div>
          </div>

          {/* Select All Checkbox */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                onChange={toggleSelectAll}
                className="size-5 cursor-pointer"
              />
              <span className="text-gray-700 font-semibold">
                Select All ({filteredOrders.length} orders)
              </span>
            </label>
          </div>
        </div>

        {filteredOrders.map((order) => {
          const allCompleted = order.items.every(item => item.completedQuantity >= item.quantity);
          const hasPartial = order.items.some(item => item.completedQuantity > 0);

          return (
            <div key={order.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectOrder(order.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="size-5 cursor-pointer"
                  />
                  <div>
                    <p className="text-gray-900 font-semibold text-lg">{order.partyName}</p>
                    <p className="text-gray-600 text-sm">
                      Order #{order.orderNo} • {new Date(order.orderDate).toLocaleDateString()} •{' '}
                      <span
                        className={`font-semibold ${
                          order.status === 'Completed'
                            ? 'text-green-600'
                            : order.status === 'Partially Completed'
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-bold text-lg">₹{order.total.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">{order.items.length} items</p>
                </div>
              </div>

              {expandedOrders.has(order.id) && (
                <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Item</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Size</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Ordered</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Completed</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Remaining</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Price</th>
                          <th className="px-4 py-3 text-right text-gray-700 font-semibold">Total</th>
                          <th className="px-4 py-3 text-left text-gray-700 font-semibold">Bills</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {order.items.map((item) => {
                          const remaining = item.quantity - item.completedQuantity;
                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{item.itemName}</td>
                              <td className="px-4 py-3 text-gray-700">{item.size}</td>
                              <td className="px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-green-600 font-semibold">{item.completedQuantity}</td>
                              <td className="px-4 py-3 text-right text-orange-600 font-semibold">{remaining}</td>
                              <td className="px-4 py-3 text-right text-gray-700">₹{item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-gray-900 font-semibold">₹{item.lineTotal.toFixed(2)}</td>
                              <td className="px-4 py-3 text-gray-700 text-sm">
                                {item.billNumbers.length > 0 ? item.billNumbers.join(', ') : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {order.status !== 'Completed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCompletionModal(order);
                      }}
                      className={`${
                        orderType === 'purchase' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                      } text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transition-all`}
                    >
                      <CheckCircle className="size-5" />
                      Complete Order (Full or Partial)
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Partial Completion Modal */}
      {completingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Complete Order - {completingOrder.partyName}</h3>
              <button onClick={closeCompletionModal} className="text-white hover:text-red-400 transition-colors">
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bill Number Input */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Bill Number *</label>
                <input
                  type="text"
                  value={billNumber}
                  onChange={(e) => setBillNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter bill number (e.g., BILL-001)"
                />
              </div>

              {/* Items Selection */}
              <div>
                <h4 className="text-gray-900 font-semibold mb-3">Select Items & Quantities to Complete</h4>
                <div className="space-y-3">
                  {completingOrder.items.map((item) => {
                    const remaining = item.quantity - item.completedQuantity;
                    if (remaining <= 0) return null;

                    return (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-gray-900 font-semibold">{item.itemName}</p>
                            <p className="text-gray-600 text-sm">
                              Size: {item.size} | Remaining: <span className="font-semibold text-orange-600">{remaining}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateSelectedQuantity(item.id, remaining)}
                              className={`${
                                orderType === 'purchase' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
                              } text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
                            >
                              Fill Remaining
                            </button>
                            <div className="w-32">
                              <label className="block text-gray-700 text-sm mb-1">Complete Qty</label>
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                value={selectedItems[item.id] || ''}
                                onChange={(e) => updateSelectedQuantity(item.id, parseInt(e.target.value) || 0)}
                                onFocus={(e) => e.target.select()}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2">
                <button
                  onClick={closeCompletionModal}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={completeOrderPartially}
                  className={`flex-1 ${
                    orderType === 'purchase' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                  } text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors`}
                >
                  <CheckCircle className="size-5" />
                  Complete Selected Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}