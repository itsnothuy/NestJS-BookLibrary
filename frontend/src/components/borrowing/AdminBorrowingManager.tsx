import { useEffect, useState } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import type { BorrowingRequest } from '../../modules/borrowing/BorrowingContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function AdminBorrowingManager() {
  const { token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<BorrowingRequest[]>([]);
  const [overdueBooks, setOverdueBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'overdue'>('pending');

  useEffect(() => {
    fetchPendingRequests();
    fetchOverdueBooks();
  }, []);

  const fetchPendingRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/borrowings/admin/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueBooks = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/borrowings/admin/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOverdueBooks(data);
      }
    } catch (error) {
      console.error('Error fetching overdue books:', error);
    }
  };

  const handleProcessRequest = async (requestUuid: string, action: 'approved' | 'rejected', reason?: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/borrowings/admin/process/${requestUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, rejectionReason: reason }),
      });

      if (res.ok) {
        alert(`Request ${action}!`);
        fetchPendingRequests();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to process request');
    }
  };

  const handleReturnBook = async (borrowingUuid: string) => {
    if (!token) return;

    const notes = prompt('Enter return notes (optional):');

    try {
      const res = await fetch(`${API_BASE}/borrowings/admin/return/${borrowingUuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnNotes: notes || undefined }),
      });

      if (res.ok) {
        alert('Book returned successfully!');
        fetchOverdueBooks();
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to process return');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="admin-borrowing-manager">
      <h2 className="text-3xl font-bold mb-6">Borrowing Management</h2>

      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </a>
        <a
          className={`tab ${activeTab === 'overdue' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue Books ({overdueBooks.length})
        </a>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="alert">
              <span>No pending requests</span>
            </div>
          ) : (
            pendingRequests.map((request: any) => (
              <div key={request.uuid} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{request.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-500">{request.book?.author}</p>
                      <p className="text-sm mt-2">
                        <strong>Requested by:</strong> {request.user?.email}
                      </p>
                      <p className="text-sm">
                        <strong>Duration:</strong> {request.requestedDays} days
                      </p>
                      <p className="text-sm">
                        <strong>Requested:</strong> {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessRequest(request.uuid, 'approved')}
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) {
                            handleProcessRequest(request.uuid, 'rejected', reason);
                          }
                        }}
                        className="btn btn-error btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'overdue' && (
        <div className="space-y-4">
          {overdueBooks.length === 0 ? (
            <div className="alert alert-success">
              <span>No overdue books!</span>
            </div>
          ) : (
            overdueBooks.map((borrowing: any) => (
              <div key={borrowing.uuid} className="card bg-base-100 shadow-xl border-2 border-error">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title">{borrowing.book?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-500">{borrowing.book?.author}</p>
                      <p className="text-sm mt-2">
                        <strong>Borrowed by:</strong> {borrowing.user?.email}
                      </p>
                      <p className="text-sm">
                        <strong>Due Date:</strong> {formatDate(borrowing.dueDate)}
                      </p>
                      <p className="text-sm text-error font-bold">
                        <strong>Days Overdue:</strong> {borrowing.daysOverdue}
                      </p>
                      <p className="text-sm text-error font-bold">
                        <strong>Late Fee:</strong> ${borrowing.lateFeeAmount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleReturnBook(borrowing.uuid)}
                      className="btn btn-primary btn-sm"
                    >
                      Process Return
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
