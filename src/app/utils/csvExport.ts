import { Order, OrderItem } from '../types';
import { getOrders } from './storage';

// Convert order to CSV row
export function orderToCSVRow(order: Order): string {
  const rows: string[] = [];
  
  // Add each item as a row
  order.items.forEach((item) => {
    const row = [
      order.orderNo,
      new Date(order.orderDate).toLocaleDateString(),
      order.partyName,
      item.itemName,
      item.size,
      item.quantity.toString(),
      item.completedQuantity.toString(),
      (item.quantity - item.completedQuantity).toString(),
      item.price.toFixed(2),
      item.lineTotal.toFixed(2),
      item.billNumbers.join('; '),
      order.total.toFixed(2),
      order.status,
      order.createdByName,
      order.orderType.toUpperCase()
    ];
    rows.push(row.map(field => `"${field}"`).join(','));
  });
  
  return rows.join('\n');
}

// Export a single completed order to CSV (append to existing file)
export async function exportCompletedOrderToCSV(order: Order): Promise<void> {
  try {
    // Get all completed orders of the same type
    const allOrders = await getOrders();
    const completedOrders = allOrders
      .filter(o => o.orderType === order.orderType && o.status === 'Completed')
      .sort((a, b) => {
        // Sort by order number (ascending: 1, 2, 3, 4...)
        const orderNoA = parseInt(a.orderNo) || 0;
        const orderNoB = parseInt(b.orderNo) || 0;
        return orderNoA - orderNoB;
      });
    
    // Create CSV content with all completed orders
    let csvData = 'Order No,Order Date,Party Name,Item Name,Size,Quantity Ordered,Completed,Remaining,Price,Line Total,Bill Numbers,Order Total,Status,Created By,Order Type\n';
    
    completedOrders.forEach(o => {
      csvData += orderToCSVRow(o) + '\n';
    });
    
    // Create blob and download with consistent filename
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Use consistent filename so user knows to replace old file
    const fileName = `MFOI_${order.orderType.toUpperCase()}_Orders_Complete.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Exported all completed ${order.orderType} orders to ${fileName}`);
  } catch (error) {
    console.error('Error exporting order to CSV:', error);
    throw error;
  }
}

// Download CSV file for all completed orders of a type
export async function downloadCSV(orderType: 'purchase' | 'sale'): Promise<void> {
  try {
    // Get all orders
    const orders = await getOrders();
    
    // Filter completed orders by type
    const filteredOrders = orders.filter(
      order => order.orderType === orderType && order.status === 'Completed'
    );
    
    if (filteredOrders.length === 0) {
      alert(`No completed ${orderType} orders found to export.`);
      return;
    }

    // Create CSV content
    let csvData = 'Order No,Order Date,Party Name,Item Name,Size,Quantity Ordered,Completed,Remaining,Price,Line Total,Bill Numbers,Order Total,Status,Created By,Order Type\n';
    
    filteredOrders.forEach(order => {
      csvData += orderToCSVRow(order) + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fileName = `MFOI_${orderType.toUpperCase()}_Orders_Complete.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Downloaded ${filteredOrders.length} ${orderType} order(s) to ${fileName}`);
    console.log(`✅ Downloaded ${orderType} orders CSV (${filteredOrders.length} orders)`);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    alert('Failed to download CSV');
  }
}