import { useState, useEffect } from 'react';
import { getAdmins, updateAdmin, deleteAdmin } from '../utils/storage';
import { Admin } from '../types';
import { Users, Trash2, Edit2, Save, X } from 'lucide-react';

interface UserManagementProps {
  currentUserEmail: string;
  currentUserRole?: 'superadmin' | 'admin';
}

export function UserManagement({ currentUserEmail, currentUserRole }: UserManagementProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    role: 'admin' as 'admin' | 'superadmin',
  });
  const [showPassword, setShowPassword] = useState(false);

  const isSuperAdmin = currentUserRole === 'superadmin';

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const allAdmins = await getAdmins();
      // Only show approved admins
      setAdmins(allAdmins.filter(a => a.approved));
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    if (!confirm(`Delete admin ${email}? This action cannot be undone.`)) return;

    try {
      await deleteAdmin(email);
      alert('✅ Admin deleted successfully');
      await loadAdmins();
    } catch (error) {
      console.error('Failed to delete admin:', error);
      alert('❌ Failed to delete admin');
    }
  };

  const startEditing = (email: string) => {
    setEditingEmail(email);
    const admin = admins.find((a) => a.email === email);
    if (admin) {
      setEditForm({
        name: admin.name,
        newEmail: admin.email,
        currentPassword: admin.password, // Load current password
        newPassword: '',
        confirmPassword: '',
        role: admin.role as 'admin' | 'superadmin',
      });
    }
  };

  const cancelEditing = () => {
    setEditingEmail(null);
    setEditForm({
      name: '',
      newEmail: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      role: 'admin' as 'admin' | 'superadmin',
    });
  };

  const saveEdit = async () => {
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      alert('❌ Passwords do not match');
      return;
    }

    if (!editForm.name.trim()) {
      alert('❌ Name cannot be empty');
      return;
    }

    if (!editForm.newEmail.trim()) {
      alert('❌ Email cannot be empty');
      return;
    }

    try {
      // Determine final password: use new password if provided, else keep current
      const finalPassword = editForm.newPassword || editForm.currentPassword;
      
      await updateAdmin(editingEmail!, {
        name: editForm.name,
        email: editForm.newEmail,
        password: finalPassword,
        role: editForm.role,
      });
      
      alert('✅ Admin updated successfully');
      await loadAdmins();
      cancelEditing();
    } catch (error) {
      console.error('Failed to update admin:', error);
      alert('❌ Failed to update admin');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">
          <Users className="inline size-6 mr-2" />
          User Management
        </h2>
        <p className="text-gray-600">Manage admin users ({admins.length} users)</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.email} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{admin.name}</td>
                <td className="px-6 py-4 text-gray-700">{admin.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      admin.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                      <button
                        onClick={() => startEditing(admin.email)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="size-4" />
                        Edit
                      </button>
                    )}
                    {admin.email !== currentUserEmail && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.email)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Admin Credentials</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="email"
                  value={editForm.newEmail}
                  onChange={(e) => setEditForm({ ...editForm, newEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'superadmin' })}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {editForm.role === 'superadmin' ? '🔒 Can edit all users' : '👤 Standard access'}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  💡 <strong>Change Password:</strong> Fill below to update, or leave blank to keep current password
                </p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      New Password
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="password"
                      value={editForm.newPassword}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Confirm New Password
                    </label>
                    <input
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="password"
                      value={editForm.confirmPassword}
                      onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  type="button"
                  onClick={saveEdit}
                >
                  <Save className="size-5" />
                  Save Changes
                </button>
                <button
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  type="button"
                  onClick={cancelEditing}
                >
                  <X className="size-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}