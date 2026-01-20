import { useState } from 'react';
import { User, Lock, Mail, Save } from 'lucide-react';
import { api } from '../utils/api';
import { Admin } from '../types';

interface ProfileProps {
  token: string;
  admin: Admin;
}

export function Profile({ token, admin }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(admin.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = admin.role === 'superadmin';

  const handleSave = async () => {
    if (!isSuperAdmin) {
      alert('Only super admins can change login credentials');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!newEmail.trim()) {
      alert('Email cannot be empty');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const updates: any = { email: newEmail.trim() };
      if (newPassword) {
        updates.password = newPassword;
      }

      const result = await api.updateProfile(token, admin.email, updates);
      
      if (result.success) {
        alert('✅ Profile updated successfully! Please login again.');
        // Force re-login since credentials changed
        window.location.reload();
      } else {
        alert('❌ ' + (result.message || 'Failed to update profile'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewEmail(admin.email);
    setNewPassword('');
    setConfirmPassword('');
    setEditing(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2 font-semibold text-xl">
          <User className="inline size-6 mr-2" />
          My Profile
        </h2>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-200 shadow-sm p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Name (read-only) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              value={admin.name}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
            <p className="text-gray-500 text-sm mt-1">Name cannot be changed</p>
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Role</label>
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-lg font-medium ${
                isSuperAdmin
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              }`}>
                {admin.role}
              </span>
            </div>
            {!isSuperAdmin && (
              <p className="text-orange-600 text-sm mt-2 font-medium">
                ⚠️ Only super admins can change email and password
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <Mail className="size-4" />
              Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={!editing || !isSuperAdmin}
              className={`w-full px-4 py-3 border-2 rounded-lg ${
                editing && isSuperAdmin
                  ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Password */}
          {editing && isSuperAdmin && (
            <>
              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Lock className="size-4" />
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password (leave empty to keep current)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                  <Lock className="size-4" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                disabled={!isSuperAdmin}
                className={`${
                  isSuperAdmin
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2`}
              >
                <User className="size-5" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="size-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>

          {/* Permissions Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Your Permissions:</h4>
            <ul className="space-y-1 text-blue-800 text-sm">
              <li>✓ View and manage items</li>
              <li>✓ Create and manage orders</li>
              <li>✓ Approve new admin requests</li>
              <li>✓ View all users</li>
              {isSuperAdmin && (
                <>
                  <li className="text-purple-700 font-semibold">✓ Change email and password (Super Admin)</li>
                  <li className="text-purple-700 font-semibold">✓ Full system control (Super Admin)</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
