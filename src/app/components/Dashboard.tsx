import { useEffect, useState } from 'react';
import { getOrders, getItems } from '../utils/storage';
import { Package, FileText, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const items = await getItems();
      const orders = await getOrders();

      setStats({
        totalItems: items.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'Open').length,
        completedOrders: orders.filter((o) => o.status === 'Completed').length,
        lowStock: items.filter((i) => i.sizes.some((s) => s.stock < 100)).length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'bg-blue-500',
      onClick: () => onNavigate('items'),
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FileText,
      color: 'bg-purple-500',
      onClick: () => onNavigate('all-orders'),
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-orange-500',
      onClick: () => onNavigate('pending-orders'),
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      onClick: () => onNavigate('all-orders'),
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock,
      icon: TrendingUp,
      color: 'bg-red-500',
      onClick: () => onNavigate('items'),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Welcome to MFOI Fastener Order Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={card.onClick}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="size-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 mb-1">{card.title}</p>
              <p className="text-gray-900">{card.value}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('purchase-order')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🛒 New Purchase Order
          </button>
          <button
            onClick={() => onNavigate('sale-order')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            🛍️ New Sale Order
          </button>
          <button
            onClick={() => onNavigate('items')}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            📦 Manage Items
          </button>
        </div>
      </div>
    </div>
  );
}