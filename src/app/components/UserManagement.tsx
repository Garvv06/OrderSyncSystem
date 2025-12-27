import { useState, useEffect } from 'react';
import { getOrders, setAuthToken } from '../utils/storage';
import { Order, Admin } from '../types';
import { Users, Package, CheckCircle, Clock, Shield, Trash2, Edit2, Save, X, Key } from 'lucide-react';

interface UserManagementProps {
  token: string;
  currentUserEmail: string;
}

interface UserStats {
  email: string;
  name: string;
  password: string;
  role: 'superadmin' | 'admin';
  totalOrders: number;
  completedOrders: number;
  openOrders: number;
  totalOrderValue: number;
}

export function UserManagement({ token, currentUserEmail }: UserManagementProps) {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'superadmin' | 'admin'>('admin');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'superadmin' | 'admin'>('admin');
  const [editingCredentials, setEditingCredentials] = useState<string | null>(null);
  const [credentialForm, setCredentialForm] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    loadUserStats();
  }, [token]);

  const loadUserStats = async () => {
    try {
      setAuthToken(token);
      
      // Get all admins from localStorage
      const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
      
      // Find current user role
      const currentUser = admins.find((a) => a.email === currentUserEmail);
      if (currentUser) {
        setCurrentUserRole(currentUser.role);
      }
      
      // Get all orders
      const allOrders = await getOrders();
      setOrders(allOrders);

      // Calculate stats for each admin
      const stats: UserStats[] = admins.map((admin) => {
        const userOrders = allOrders.filter((order) => order.createdBy === admin.email);
        const completedOrders = userOrders.filter((order) => order.status === 'Completed');
        const openOrders = userOrders.filter((order) => order.status === 'Open');
        const totalValue = userOrders.reduce((sum, order) => sum + order.total, 0);

        return {
          email: admin.email,
          name: admin.name,
          password: admin.password,
          role: admin.role,
          totalOrders: userOrders.length,
          completedOrders: completedOrders.length,
          openOrders: openOrders.length,
          totalOrderValue: totalValue,
        };
      });

      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (userEmail: string) => {
    if (currentUserRole !== 'superadmin') {
      alert('Only Super Admin can change user roles');
      return;
    }

    if (userEmail === currentUserEmail) {
      alert('You cannot change your own role');
      return;
    }

    setEditingUser(userEmail);
    const user = userStats.find((u) => u.email === userEmail);
    if (user) {
      setNewRole(user.role);
    }
  };

  const handleSaveRole = () => {
    if (!editingUser) return;

    const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
    const adminIndex = admins.findIndex((a) => a.email === editingUser);

    if (adminIndex !== -1) {
      admins[adminIndex].role = newRole;
      localStorage.setItem('admins', JSON.stringify(admins));
      loadUserStats();
      setEditingUser(null);
    }
  };

  const handleEditCredentials = (userEmail: string) => {
    if (currentUserRole !== 'superadmin') {
      alert('Only Super Admin can edit user credentials');
      return;
    }

    const user = userStats.find((u) => u.email === userEmail);
    if (user) {
      setEditingCredentials(userEmail);
      setCredentialForm({
        email: user.email,
        password: user.password,
        name: user.name,
      });
    }
  };

  const handleSaveCredentials = () => {
    if (!editingCredentials) return;

    if (!credentialForm.email.trim() || !credentialForm.password.trim() || !credentialForm.name.trim()) {
      alert('All fields are required');
      return;
    }

    // Email validation
    if (!credentialForm.email.includes('@')) {
      alert('Please enter a valid email');
      return;
    }

    const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
    const adminIndex = admins.findIndex((a) => a.email === editingCredentials);

    if (adminIndex !== -1) {
      // Check if new email already exists (except for current user)
      if (credentialForm.email !== editingCredentials) {
        const emailExists = admins.some(a => a.email === credentialForm.email);
        if (emailExists) {
          alert('Email already exists');
          return;
        }
      }

      // Update admin credentials
      admins[adminIndex] = {
        ...admins[adminIndex],
        email: credentialForm.email,
        password: credentialForm.password,
        name: credentialForm.name,
      };

      // Update orders if email changed
      if (credentialForm.email !== editingCredentials) {
        const ordersKey = `orders_${token}`;
        const ordersData = localStorage.getItem(ordersKey);
        if (ordersData) {
          const orders = JSON.parse(ordersData);
          orders.forEach((order: Order) => {
            if (order.createdBy === editingCredentials) {
              order.createdBy = credentialForm.email;
            }
          });
          localStorage.setItem(ordersKey, JSON.stringify(orders));
        }
      }

      localStorage.setItem('admins', JSON.stringify(admins));
      alert('Credentials updated successfully! Changes will affect login immediately.');
      loadUserStats();
      setEditingCredentials(null);
      setCredentialForm({ email: '', password: '', name: '' });
    }
  };

  const handleDeleteUser = (userEmail: string) => {
    if (currentUserRole !== 'superadmin') {
      alert('Only Super Admin can delete users');
      return;
    }

    if (userEmail === currentUserEmail) {
      alert('You cannot delete yourself');
      return;
    }

    const user = userStats.find((u) => u.email === userEmail);
    if (!user) return;

    if (confirm(`Delete user ${user.name} (${userEmail})? This action cannot be undone.`)) {
      const admins: Admin[] = JSON.parse(localStorage.getItem('admins') || '[]');
      const filtered = admins.filter((a) => a.email !== userEmail);
      localStorage.setItem('admins', JSON.stringify(filtered));
      loadUserStats();
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">👥 User Management</h2>
        <p className="text-gray-600">
          {currentUserRole === 'superadmin' 
            ? 'Manage admin users and their permissions (Super Admin Access)' 
            : 'View admin users and statistics (Read Only - Admin Access)'}
        </p>
      </div>

      <div className="space-y-4">
        {userStats.map((user) => (
          <div key={user.email} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Edit Credentials Form */}
            {editingCredentials === user.email ? (
              <div className="p-6 bg-yellow-50 border-2 border-yellow-300">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <Key className="size-5" />
                  Edit Credentials - {user.name}
                </h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={credentialForm.name}
                      onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Email (Login ID) *</label>
                    <input
                      type="email"
                      value={credentialForm.email}
                      onChange={(e) => setCredentialForm({ ...credentialForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Password *</label>
                    <input
                      type="text"
                      value={credentialForm.password}
                      onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <p className="text-sm text-yellow-700 mb-4">
                  ⚠️ Changing email/password will affect login immediately
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveCredentials}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="size-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingCredentials(null);
                      setCredentialForm({ email: '', password: '', name: '' });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X className="size-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* User Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-full p-2">
                      {user.role === 'superadmin' ? (
                        <Shield className="size-6 text-red-600" />
                      ) : (
                        <Users className="size-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white">{user.name}</h3>
                      <p className="text-red-100">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full ${
                        user.role === 'superadmin'
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-blue-400 text-blue-900'
                      }`}
                    >
                      {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                    {user.email === currentUserEmail && (
                      <span className="px-3 py-1 rounded-full bg-white text-red-600">
                        You
                      </span>
                    )}
                  </div>
                </div>

                {/* User Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="size-5 text-blue-600" />
                        <span className="text-gray-600">Total Orders</span>
                      </div>
                      <p className="text-2xl text-gray-900">{user.totalOrders}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="size-5 text-green-600" />
                        <span className="text-gray-600">Completed</span>
                      </div>
                      <p className="text-2xl text-gray-900">{user.completedOrders}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="size-5 text-orange-600" />
                        <span className="text-gray-600">Open</span>
                      </div>
                      <p className="text-2xl text-gray-900">{user.openOrders}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600">₹</span>
                        <span className="text-gray-600">Total Value</span>
                      </div>
                      <p className="text-2xl text-gray-900">₹{user.totalOrderValue.toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Super Admin Actions */}
                  {currentUserRole === 'superadmin' && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 mb-3">Super Admin Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {/* Edit Credentials */}
                        <button
                          onClick={() => handleEditCredentials(user.email)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                        >
                          <Key className="size-4" />
                          Edit Credentials
                        </button>

                        {/* Change Role */}
                        {user.email !== currentUserEmail && (
                          <>
                            {editingUser === user.email ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={newRole}
                                  onChange={(e) => setNewRole(e.target.value as 'superadmin' | 'admin')}
                                  className="px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                  <option value="admin">Admin</option>
                                  <option value="superadmin">Super Admin</option>
                                </select>
                                <button
                                  onClick={handleSaveRole}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                                >
                                  <Save className="size-4" />
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleChangeRole(user.email)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                              >
                                <Edit2 className="size-4" />
                                Change Role
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                              <Trash2 className="size-4" />
                              Delete User
                            </button>
                          </>
                        )}

                        {/* Edit Own Credentials */}
                        {user.email === currentUserEmail && (
                          <p className="text-gray-600 text-sm">
                            You can edit your own credentials using the "Edit Credentials" button above
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
