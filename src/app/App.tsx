import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ItemsList } from './components/ItemsList';
import { NewOrder } from './components/NewOrder';
import { OrdersList } from './components/OrdersList';
import { AdminApproval } from './components/AdminApproval';
import { UserManagement } from './components/UserManagement';
import { Package, FileText, PlusCircle, Clock, LogOut, UserCheck, Users } from 'lucide-react';
import { api } from './utils/api';
import mfoiLogo from 'figma:asset/b83a330ecb651eee17bb0c1cb9db3f1f6df36a92.png';

type View = 'dashboard' | 'items' | 'new-order' | 'all-orders' | 'pending-orders' | 'admin-approval' | 'users';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
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

  const handleLoginSuccess = (newToken: string, adminData: { email: string; name: string }) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-red-600 shadow-md sticky top-0 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src={mfoiLogo}
              alt="MFOI Logo"
              className="h-14"
            />
            <div>
              <h1 className="text-gray-900">MFOI</h1>
              <p className="text-gray-600">Welcome, {admin?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 py-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="size-4" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('items')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'items'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="size-4" />
            Item List
          </button>
          <button
            onClick={() => setCurrentView('new-order')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'new-order'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PlusCircle className="size-4" />
            Place New Order
          </button>
          <button
            onClick={() => setCurrentView('all-orders')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'all-orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="size-4" />
            Previous Orders
          </button>
          <button
            onClick={() => setCurrentView('pending-orders')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'pending-orders'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="size-4" />
            Remaining Orders
          </button>
          <button
            onClick={() => setCurrentView('admin-approval')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'admin-approval'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCheck className="size-4" />
            Admin Approval
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
              currentView === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="size-4" />
            User Management
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} token={token!} />}
        {currentView === 'items' && <ItemsList token={token!} />}
        {currentView === 'new-order' && (
          <NewOrder 
            token={token!}
            adminName={admin?.name || ''}
            adminEmail={admin?.email || ''}
            onOrderCreated={() => setCurrentView('all-orders')}
          />
        )}
        {currentView === 'all-orders' && <OrdersList filter="all" token={token!} />}
        {currentView === 'pending-orders' && <OrdersList filter="pending" token={token!} />}
        {currentView === 'admin-approval' && <AdminApproval token={token!} />}
        {currentView === 'users' && <UserManagement token={token!} currentUserEmail={admin?.email || ''} />}
      </main>
    </div>
  );
}