import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import Header from '../layout/Header';
import NavTab from '../layout/NavTab';
import PaginatedTable from '../table/PaginatedTable';
import { usePagination } from '../../hooks/usePagination';
import type { BorrowingRequest } from '../../modules/borrowing/BorrowingContext';
import './AdminBorrowingManager.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function AdminBorrowingManager() {
  const { token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<BorrowingRequest[]>([]);
  const [overdueBooks, setOverdueBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'overdue'>('pending');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  const pendingPagination = usePagination(10);
  const overduePagination = usePagination(10);

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
        setShowApproveModal(false);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('Failed to process request');
    }
  };

  const handleReturnBook = async (borrowingUuid: string, notes: string) => {
    if (!token) return;

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
        setShowReturnModal(false);
        setReturnNotes('');
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

  const handlePendingSort = (columnKey: string) => {
    const newOrder = pendingPagination.state.sortBy === columnKey && pendingPagination.state.sortOrder === 'asc' ? 'desc' : 'asc';
    pendingPagination.updateSort(columnKey, newOrder);
  };

  const handleOverdueSort = (columnKey: string) => {
    const newOrder = overduePagination.state.sortBy === columnKey && overduePagination.state.sortOrder === 'asc' ? 'desc' : 'asc';
    overduePagination.updateSort(columnKey, newOrder);
  };

  const pendingColumns = useMemo(() => [
    {
      key: 'book',
      label: 'Book',
      sortable: true,
      render: (request: any) => (
        <div className="admin-borrowing-book-cell">
          <div className="admin-borrowing-book-title">{request.book?.title || 'Unknown'}</div>
          <div className="admin-borrowing-book-author">{request.book?.author || 'Unknown Author'}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Requested By',
      sortable: true,
      width: '200px',
      render: (request: any) => (
        <div className="admin-borrowing-user-cell">
          {request.user?.email || 'Unknown User'}
        </div>
      )
    },
    {
      key: 'requestedDays',
      label: 'Duration',
      sortable: true,
      width: '100px',
      render: (request: any) => (
        <div className="admin-borrowing-duration-cell">
          {request.requestedDays} days
        </div>
      )
    },
    {
      key: 'requestedAt',
      label: 'Requested Date',
      sortable: true,
      width: '130px',
      render: (request: any) => (
        <div className="admin-borrowing-date-cell">
          {formatDate(request.requestedAt)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (request: any) => (
        <div className="admin-borrowing-actions">
          <button
            onClick={() => {
              setSelectedRequest(request);
              setShowApproveModal(true);
            }}
            className="admin-borrowing-btn-approve"
          >
            Approve
          </button>
          <button
            onClick={() => {
              setSelectedRequest(request);
              setShowRejectModal(true);
            }}
            className="admin-borrowing-btn-reject"
          >
            Reject
          </button>
        </div>
      )
    }
  ], []);

  const overdueColumns = useMemo(() => [
    {
      key: 'book',
      label: 'Book',
      sortable: true,
      render: (borrowing: any) => (
        <div className="admin-borrowing-book-cell">
          <div className="admin-borrowing-book-title">{borrowing.book?.title || 'Unknown'}</div>
          <div className="admin-borrowing-book-author">{borrowing.book?.author || 'Unknown Author'}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Borrowed By',
      sortable: true,
      width: '200px',
      render: (borrowing: any) => (
        <div className="admin-borrowing-user-cell">
          {borrowing.user?.email || 'Unknown User'}
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      width: '130px',
      render: (borrowing: any) => (
        <div className="admin-borrowing-date-cell admin-borrowing-overdue-text">
          {formatDate(borrowing.dueDate)}
        </div>
      )
    },
    {
      key: 'daysOverdue',
      label: 'Days Overdue',
      sortable: true,
      width: '120px',
      render: (borrowing: any) => (
        <div className="admin-borrowing-overdue-days">
          {borrowing.daysOverdue} days
        </div>
      )
    },
    {
      key: 'lateFeeAmount',
      label: 'Late Fee',
      sortable: true,
      width: '100px',
      render: (borrowing: any) => (
        <div className="admin-borrowing-late-fee">
          ${borrowing.lateFeeAmount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (borrowing: any) => (
        <div className="admin-borrowing-actions">
          <button
            onClick={() => {
              setSelectedRequest(borrowing);
              setShowReturnModal(true);
            }}
            className="admin-borrowing-btn-return"
          >
            Process Return
          </button>
        </div>
      )
    }
  ], []);

  if (loading) {
    return (
      <>
        <Header />
        <NavTab activeTab="admin-borrowings" setActiveTab={() => {}} />
        <div className="admin-borrowing-container">
          <div className="admin-borrowing-loading">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading borrowing data...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <NavTab activeTab="admin-borrowings" setActiveTab={() => {}} />
      <div className="admin-borrowing-container">
        <div className="admin-borrowing-header">
          <h2 className="admin-borrowing-title">Borrowing Management</h2>
          <button
            onClick={() => {
              fetchPendingRequests();
              fetchOverdueBooks();
            }}
            className="admin-borrowing-refresh-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="admin-borrowing-stats">
          <div className="admin-borrowing-stat-card">
            <div className="admin-borrowing-stat-icon admin-borrowing-stat-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="admin-borrowing-stat-content">
              <div className="admin-borrowing-stat-label">Pending Requests</div>
              <div className="admin-borrowing-stat-value admin-borrowing-stat-value-warning">
                {pendingRequests.length}
              </div>
            </div>
          </div>

          <div className="admin-borrowing-stat-card">
            <div className="admin-borrowing-stat-icon admin-borrowing-stat-icon-danger">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="admin-borrowing-stat-content">
              <div className="admin-borrowing-stat-label">Overdue Books</div>
              <div className="admin-borrowing-stat-value admin-borrowing-stat-value-danger">
                {overdueBooks.length}
              </div>
            </div>
          </div>

          <div className="admin-borrowing-stat-card">
            <div className="admin-borrowing-stat-icon admin-borrowing-stat-icon-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="admin-borrowing-stat-content">
              <div className="admin-borrowing-stat-label">Total Late Fees</div>
              <div className="admin-borrowing-stat-value admin-borrowing-stat-value-primary">
                ${overdueBooks.reduce((sum, b) => sum + b.lateFeeAmount, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-borrowing-tabs">
          <button
            className={`admin-borrowing-tab ${activeTab === 'pending' ? 'admin-borrowing-tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            className={`admin-borrowing-tab ${activeTab === 'overdue' ? 'admin-borrowing-tab-active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            Overdue Books ({overdueBooks.length})
          </button>
        </div>

        {/* Pending Requests Table */}
        {activeTab === 'pending' && (
          <PaginatedTable
            data={pendingRequests}
            columns={pendingColumns}
            pagination={{
              currentPage: pendingPagination.state.page,
              totalPages: Math.ceil(pendingRequests.length / pendingPagination.state.limit),
              hasNextPage: pendingPagination.state.page < Math.ceil(pendingRequests.length / pendingPagination.state.limit),
              hasPreviousPage: pendingPagination.state.page > 1,
              total: pendingRequests.length,
              pageSize: pendingPagination.state.limit
            }}
            sorting={{
              sortBy: pendingPagination.state.sortBy,
              sortOrder: pendingPagination.state.sortOrder
            }}
            onPageChange={pendingPagination.goToPage}
            onSort={handlePendingSort}
            loading={loading}
            emptyMessage="No pending requests"
          />
        )}

        {/* Overdue Books Table */}
        {activeTab === 'overdue' && (
          <PaginatedTable
            data={overdueBooks}
            columns={overdueColumns}
            pagination={{
              currentPage: overduePagination.state.page,
              totalPages: Math.ceil(overdueBooks.length / overduePagination.state.limit),
              hasNextPage: overduePagination.state.page < Math.ceil(overdueBooks.length / overduePagination.state.limit),
              hasPreviousPage: overduePagination.state.page > 1,
              total: overdueBooks.length,
              pageSize: overduePagination.state.limit
            }}
            sorting={{
              sortBy: overduePagination.state.sortBy,
              sortOrder: overduePagination.state.sortOrder
            }}
            onPageChange={overduePagination.goToPage}
            onSort={handleOverdueSort}
            loading={loading}
            emptyMessage="No overdue books"
          />
        )}

        {/* Approve Modal */}
        {showApproveModal && selectedRequest && (
          <div className="admin-borrowing-modal-overlay" onClick={() => setShowApproveModal(false)}>
            <div className="admin-borrowing-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-borrowing-modal-title">Approve Borrowing Request</h3>
              <div className="admin-borrowing-modal-content">
                <p><strong>Book:</strong> {selectedRequest.book?.title}</p>
                <p><strong>Requested by:</strong> {selectedRequest.user?.email}</p>
                <p><strong>Duration:</strong> {selectedRequest.requestedDays} days</p>
                <p className="admin-borrowing-modal-confirm">Are you sure you want to approve this request?</p>
              </div>
              <div className="admin-borrowing-modal-actions">
                <button
                  onClick={() => handleProcessRequest(selectedRequest.uuid, 'approved')}
                  className="admin-borrowing-modal-btn-confirm"
                >
                  Confirm Approval
                </button>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="admin-borrowing-modal-btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="admin-borrowing-modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="admin-borrowing-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-borrowing-modal-title">Reject Borrowing Request</h3>
              <div className="admin-borrowing-modal-content">
                <p><strong>Book:</strong> {selectedRequest.book?.title}</p>
                <p><strong>Requested by:</strong> {selectedRequest.user?.email}</p>
                <label className="admin-borrowing-modal-label">
                  Rejection Reason (required):
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="admin-borrowing-modal-textarea"
                    placeholder="Enter reason for rejection..."
                    rows={4}
                  />
                </label>
              </div>
              <div className="admin-borrowing-modal-actions">
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      handleProcessRequest(selectedRequest.uuid, 'rejected', rejectionReason);
                    } else {
                      alert('Please provide a rejection reason');
                    }
                  }}
                  className="admin-borrowing-modal-btn-danger"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="admin-borrowing-modal-btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Book Modal */}
        {showReturnModal && selectedRequest && (
          <div className="admin-borrowing-modal-overlay" onClick={() => setShowReturnModal(false)}>
            <div className="admin-borrowing-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-borrowing-modal-title">Process Book Return</h3>
              <div className="admin-borrowing-modal-content">
                <p><strong>Book:</strong> {selectedRequest.book?.title}</p>
                <p><strong>Borrowed by:</strong> {selectedRequest.user?.email}</p>
                <p className="admin-borrowing-overdue-warning">
                  <strong>Days Overdue:</strong> {selectedRequest.daysOverdue} days
                </p>
                <p className="admin-borrowing-overdue-warning">
                  <strong>Late Fee:</strong> ${selectedRequest.lateFeeAmount.toFixed(2)}
                </p>
                <label className="admin-borrowing-modal-label">
                  Return Notes (optional):
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    className="admin-borrowing-modal-textarea"
                    placeholder="Enter any notes about the book condition..."
                    rows={4}
                  />
                </label>
              </div>
              <div className="admin-borrowing-modal-actions">
                <button
                  onClick={() => handleReturnBook(selectedRequest.uuid, returnNotes)}
                  className="admin-borrowing-modal-btn-confirm"
                >
                  Confirm Return
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnNotes('');
                  }}
                  className="admin-borrowing-modal-btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
