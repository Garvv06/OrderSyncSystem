import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { UserCheck, UserX, Clock } from 'lucide-react';
import { PendingAdmin } from '../types';

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
      setPendingAdmins(result.pendingAdmins || []);
    } catch (error) {
      console.error('Failed to load pending admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (confirm('Approve this admin request?')) {
      await api.approveAdmin(token, requestId);
      await loadPendingAdmins();
    }
  };

  const handleReject = async (requestId: string) => {
    if (confirm('Reject this admin request?')) {
      await api.rejectAdmin(token, requestId);
      await loadPendingAdmins();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">👥 Pending Admin Requests</h2>
        <p className="text-gray-600">
          Review and approve/reject admin access requests
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">Loading requests...</p>
        </div>
      ) : pendingAdmins.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <Clock className="size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pending admin requests</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingAdmins.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="mb-4">
                <h3 className="text-gray-900 mb-1">{request.name}</h3>
                <p className="text-gray-600">{request.email}</p>
                <p className="text-gray-500 mt-2">
                  Requested: {new Date(request.requestedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(request.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="size-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <UserX className="size-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
