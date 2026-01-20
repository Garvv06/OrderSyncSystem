import React, { useState, useEffect } from 'react';
import logo from '../assets/b83a330ecb651eee17bb0c1cb9db3f1f6df36a92.png';
import { Admin } from './types';
import { api } from './utils/api';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ItemsList } from './components/ItemsList';
import { OrdersList } from './components/OrdersList';
import { CreateOrder } from './components/CreateOrder';
import { AdminApproval } from './components/AdminApproval';
import { UserManagement } from './components/UserManagement';
import { LogOut, Package, ShoppingCart, FileText, UserCheck, Users, LayoutDashboard, Clock, ShoppingBag, Cloud, HardDrive, Menu, X } from 'lucide-react';
import { isSupabaseConfigured } from './utils/supabase';

type View = 'dashboard' | 'items' | 'all-orders' | 'pending-orders' | 'purchase-order' | 'sale-order' | 'admin-approval' | 'user-management';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderTypeView, setOrderTypeView] = useState<'purchase' | 'sale'>('purchase');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (storedToken: string) => {
    try {
      const result = await api.verify(storedToken);
      if (result.valid && result.admin) {
        setToken(storedToken);
        setAdmin(result.admin);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (newToken: string, adminData: Admin) => {
    setToken(newToken);
    setAdmin(adminData);
    setIsAuthenticated(true);
    localStorage.setItem('admin_token', newToken);
  };

  const handleLogout = async () => {
    if (token) {
      await api.logout(token);
    }
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_token');
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r-4 border-red-600 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <img src={logo} alt="MFOI Logo" className="h-12 w-auto" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-red-400 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>
            <div className="text-white">
              <p className="font-semibold">{admin?.name}</p>
              <p className="text-gray-400 text-sm">{admin?.role}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <LayoutDashboard className="size-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => navigateTo('items')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'items'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Package className="size-5" />
              <span className="font-medium">Items</span>
            </button>

            <button
              onClick={() => navigateTo('purchase-order')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'purchase-order'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <ShoppingCart className="size-5" />
              <span className="font-medium">Purchase Order</span>
            </button>

            <button
              onClick={() => navigateTo('sale-order')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'sale-order'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <ShoppingBag className="size-5" />
              <span className="font-medium">Sale Order</span>
            </button>

            <button
              onClick={() => navigateTo('all-orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'all-orders'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <FileText className="size-5" />
              <span className="font-medium">All Orders</span>
            </button>

            <button
              onClick={() => navigateTo('pending-orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'pending-orders'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Clock className="size-5" />
              <span className="font-medium">Pending Orders</span>
            </button>

            <button
              onClick={() => navigateTo('admin-approval')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'admin-approval'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <UserCheck className="size-5" />
              <span className="font-medium">Approvals</span>
            </button>

            <button
              onClick={() => navigateTo('user-management')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === 'user-management'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Users className="size-5" />
              <span className="font-medium">Users</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="size-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b-4 border-red-600 shadow-lg sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:text-red-400 transition-colors"
              >
                <Menu className="size-6" />
              </button>
              <div>
                <h1 className="text-white font-bold text-xl">MFOI Admin System</h1>
                <p className="text-gray-300 text-sm">Welcome, {admin?.name}</p>
              </div>
            </div>
            {/* Database Status */}
            <div className="hidden md:flex items-center gap-2">
              {isSupabaseConfigured ? (
                <div className="flex items-center gap-2 bg-green-600 px-3 py-1 rounded-full">
                  <Cloud className="size-4 text-white" />
                  <span className="text-white text-sm font-medium">Cloud Sync</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-600 px-3 py-1 rounded-full">
                  <HardDrive className="size-4 text-white" />
                  <span className="text-white text-sm font-medium">Local Mode</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} token={token!} />}
          {currentView === 'items' && <ItemsList token={token!} />}
          {currentView === 'purchase-order' && (
            <CreateOrder
              token={token!}
              adminName={admin?.name || ''}
              adminEmail={admin?.email || ''}
              orderType="purchase"
              onOrderCreated={() => setCurrentView('all-orders')}
            />
          )}
          {currentView === 'sale-order' && (
            <CreateOrder
              token={token!}
              adminName={admin?.name || ''}
              adminEmail={admin?.email || ''}
              orderType="sale"
              onOrderCreated={() => setCurrentView('all-orders')}
            />
          )}
          {currentView === 'all-orders' && (
            <div>
              <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderTypeView('purchase')}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                      orderTypeView === 'purchase'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="size-5" />
                    Purchase Orders
                  </button>
                  <button
                    onClick={() => setOrderTypeView('sale')}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                      orderTypeView === 'sale'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingBag className="size-5" />
                    Sale Orders
                  </button>
                </div>
              </div>
              <OrdersList filter="all" token={token!} orderType={orderTypeView} />
            </div>
          )}
          {currentView === 'pending-orders' && (
            <div>
              <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderTypeView('purchase')}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                      orderTypeView === 'purchase'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className="size-5" />
                    Purchase Orders
                  </button>
                  <button
                    onClick={() => setOrderTypeView('sale')}
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                      orderTypeView === 'sale'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingBag className="size-5" />
                    Sale Orders
                  </button>
                </div>
              </div>
              <OrdersList filter="pending" token={token!} orderType={orderTypeView} />
            </div>
          )}
          {currentView === 'admin-approval' && <AdminApproval token={token!} />}
          {currentView === 'user-management' && (
            <UserManagement token={token!} currentUserEmail={admin?.email || ''} currentUserRole={admin?.role} />
          )}
        </main>
      </div>
    </div>
  );
}
