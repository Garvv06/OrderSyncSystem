import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PendingAdmin } from '../types';
import { UserCheck, CheckCircle, XCircle } from 'lucide-react';

interface AdminApprovalProps {
  token: string;
}

export function AdminApproval({ token }: AdminApprovalProps) {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingAdmins();
  }, [token]);

  const loadPendingAdmins = async () => {
    try {
      const result = await api.getPendingAdmins(token);
      if (result.success && result.admins) {
        setPendingAdmins(result.admins);
      }
    } catch (error) {
      console.error('Failed to load pending admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveAdmin = async (adminId: string) => {
    try {
      const result = await api.approveAdmin(token, adminId);
      if (result.success) {
        alert('✅ Admin approved successfully!');
        await loadPendingAdmins();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Failed to approve admin:', error);
      alert('❌ Failed to approve admin');
    }
  };

  const rejectAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
      const result = await api.rejectAdmin(token, adminId);
      if (result.success) {
        alert('✅ Request rejected');
        await loadPendingAdmins();
      } else {
        alert('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Failed to reject admin:', error);
      alert('❌ Failed to reject admin');
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
          <UserCheck className="inline size-6 mr-2" />
          Admin Approval Requests
        </h2>
        <p className="text-gray-600">Review and approve admin access requests</p>
      </div>

      {pendingAdmins.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No pending approval requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAdmins.map((admin) => (
            <div key={admin.id} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-semibold">{admin.name}</p>
                  <p className="text-gray-600">{admin.email}</p>
                  <p className="text-gray-500 text-sm">
                    Requested: {new Date(admin.requestedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveAdmin(admin.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="size-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => rejectAdmin(admin.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="size-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
