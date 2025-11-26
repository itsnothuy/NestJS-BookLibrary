import { useEffect, useMemo, useState } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';
import PaginatedTable from '../table/PaginatedTable';
import { usePagination } from '../../hooks/usePagination';
import './MyBorrowings.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function MyBorrowings() {
  const { borrowings, requests, loading, error, refreshBorrowings, refreshRequests, returnBook, cancelRequest } = useBorrowing();
  const borrowingsPagination = usePagination(10);
  const requestsPagination = usePagination(10);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'borrowed'>('borrowed');
  const [returningUuid, setReturningUuid] = useState<string | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [selectedBorrowing, setSelectedBorrowing] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [cancellingUuid, setCancellingUuid] = useState<string | null>(null);

  useEffect(() => {
    refreshBorrowings();
    refreshRequests();
  }, [refreshBorrowings, refreshRequests]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'my-borrowings-status-active',
      overdue: 'my-borrowings-status-overdue',
      returned: 'my-borrowings-status-returned',
      pending: 'my-borrowings-status-pending',
      approved: 'my-borrowings-status-approved',
      rejected: 'my-borrowings-status-rejected',
      cancelled: 'my-borrowings-status-cancelled'
    };
    return statusColors[status] || 'my-borrowings-status-default';
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleBorrowingsSort = (columnKey: string) => {
    const newOrder = borrowingsPagination.state.sortBy === columnKey && borrowingsPagination.state.sortOrder === 'asc' ? 'desc' : 'asc';
    borrowingsPagination.updateSort(columnKey, newOrder);
  };

  const handleRequestsSort = (columnKey: string) => {
    const newOrder = requestsPagination.state.sortBy === columnKey && requestsPagination.state.sortOrder === 'asc' ? 'desc' : 'asc';
    requestsPagination.updateSort(columnKey, newOrder);
  };

  const handleReturnClick = (borrowing: any) => {
    setSelectedBorrowing(borrowing);
    setShowReturnModal(true);
  };

  const handleReturnBook = async () => {
    if (!selectedBorrowing) return;
    
    try {
      setReturningUuid(selectedBorrowing.uuid);
      await returnBook(selectedBorrowing.uuid, returnNotes);
      alert(`Book "${selectedBorrowing.book?.title}" returned successfully!`);
      setShowReturnModal(false);
      setReturnNotes('');
      setSelectedBorrowing(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to return book');
    } finally {
      setReturningUuid(null);
    }
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleCancelRequest = (request: any) => {
    setSelectedRequest(request);
    setShowCancelModal(true);
  };

  const confirmCancelRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setCancellingUuid(selectedRequest.uuid);
      await cancelRequest(selectedRequest.uuid);
      alert(`Request for "${selectedRequest.book?.title}" cancelled successfully!`);
      setShowCancelModal(false);
      setSelectedRequest(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to cancel request');
    } finally {
      setCancellingUuid(null);
    }
  };

  const getBookCoverUrl = (book: any) => {
    return book?.coverImageFilename ? `${API_BASE}/uploads/book-covers/${book.coverImageFilename}` : 'https://via.placeholder.com/200x300/e5e7eb/6b7280?text=No+Cover';
  };

  // Borrowings columns
  const borrowingsColumns = useMemo(() => [
    {
      key: 'book',
      label: 'Book Title',
      sortable: true,
      render: (borrowing: any) => (
        <div className="my-borrowings-book-cell">
          <div className="my-borrowings-book-title">{borrowing.book?.title || 'Unknown'}</div>
          <div className="my-borrowings-book-author">{borrowing.book?.author || 'Unknown Author'}</div>
        </div>
      )
    },
    {
      key: 'borrowedAt',
      label: 'Borrowed Date',
      sortable: true,
      width: '130px',
      render: (borrowing: any) => (
        <div className="my-borrowings-date-cell">
          {formatDate(borrowing.borrowedAt)}
        </div>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      width: '180px',
      render: (borrowing: any) => {
        const daysRemaining = getDaysRemaining(borrowing.dueDate);
        return (
          <div className="my-borrowings-due-date-cell">
            <div>{formatDate(borrowing.dueDate)}</div>
            {borrowing.status === 'active' && (
              <div className={daysRemaining < 3 ? 'my-borrowings-due-warning' : 'my-borrowings-due-normal'}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (borrowing: any) => (
        <span className={`my-borrowings-status-badge ${getStatusBadge(borrowing.status)}`}>
          {borrowing.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'lateFee',
      label: 'Late Fee',
      sortable: true,
      width: '100px',
      render: (borrowing: any) => (
        <div className="my-borrowings-fee-cell">
          {borrowing.lateFeeAmount > 0 ? (
            <span className="my-borrowings-fee-amount">${borrowing.lateFeeAmount.toFixed(2)}</span>
          ) : (
            <span className="my-borrowings-no-fee">$0.00</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      render: (borrowing: any) => (
        <div className="my-borrowings-actions">
          {(borrowing.status === 'active' || borrowing.status === 'overdue') && (
            <button
              onClick={() => handleReturnClick(borrowing)}
              className="my-borrowings-return-button"
            >
              Return Book
            </button>
          )}
        </div>
      )
    }
  ], []);

  // Requests columns
  const requestsColumns = useMemo(() => [
    {
      key: 'book',
      label: 'Book Title',
      sortable: true,
      render: (request: any) => (
        <div className="my-borrowings-book-cell">
          <div className="my-borrowings-book-title">{request.book?.title || 'Unknown'}</div>
          <div className="my-borrowings-book-author">{request.book?.author || 'Unknown Author'}</div>
        </div>
      )
    },
    {
      key: 'requestedAt',
      label: 'Requested Date',
      sortable: true,
      width: '140px',
      render: (request: any) => (
        <div className="my-borrowings-date-cell">
          {formatDate(request.requestedAt)}
        </div>
      )
    },
    {
      key: 'requestedDays',
      label: 'Duration',
      sortable: true,
      width: '100px',
      render: (request: any) => (
        <div className="my-borrowings-date-cell">
          {request.requestedDays} days
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (request: any) => (
        <span className={`my-borrowings-status-badge ${getStatusBadge(request.status)}`}>
          {request.status.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '200px',
      render: (request: any) => (
        <div className="my-borrowings-actions">
          <button
            onClick={() => handleViewRequest(request)}
            className="my-borrowings-view-button"
          >
            View
          </button>
          {request.status === 'pending' && (
            <button
              onClick={() => handleCancelRequest(request)}
              className="my-borrowings-cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ], []);

  if (loading) {
    return (
      <div className="my-borrowings-container">
        <div className="my-borrowings-loading">
          <span className="loading loading-spinner loading-lg"></span>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-borrowings-container">
        <div className="my-borrowings-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => {
            refreshBorrowings();
            refreshRequests();
          }} className="my-borrowings-retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter pending requests only
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="my-borrowings-container">
        <div className="my-borrowings-header">
          <h2 className="my-borrowings-title">My Borrowings</h2>
          <button onClick={() => {
            refreshBorrowings();
            refreshRequests();
          }} className="my-borrowings-refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="my-borrowings-stats">
          <div className="my-borrowings-stat-card">
            <div className="my-borrowings-stat-icon my-borrowings-stat-icon-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="my-borrowings-stat-content">
              <div className="my-borrowings-stat-label">Currently Borrowed</div>
              <div className="my-borrowings-stat-value">{borrowings.length}</div>
            </div>
          </div>

          <div className="my-borrowings-stat-card">
            <div className="my-borrowings-stat-icon my-borrowings-stat-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="my-borrowings-stat-content">
              <div className="my-borrowings-stat-label">Pending Requests</div>
              <div className="my-borrowings-stat-value my-borrowings-stat-value-warning">
                {pendingRequests.length}
              </div>
            </div>
          </div>

          <div className="my-borrowings-stat-card">
            <div className="my-borrowings-stat-icon my-borrowings-stat-icon-danger">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="my-borrowings-stat-content">
              <div className="my-borrowings-stat-label">Overdue</div>
              <div className="my-borrowings-stat-value my-borrowings-stat-value-danger">
                {borrowings.filter(b => b.status === 'overdue').length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="my-borrowings-tabs">
          <button
            className={`my-borrowings-tab ${activeTab === 'pending' ? 'my-borrowings-tab-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            className={`my-borrowings-tab ${activeTab === 'borrowed' ? 'my-borrowings-tab-active' : ''}`}
            onClick={() => setActiveTab('borrowed')}
          >
            Currently Borrowed ({borrowings.length})
          </button>
        </div>

        {/* Currently Borrowed Table */}
        {activeTab === 'borrowed' && (
          <PaginatedTable
            data={borrowings}
            columns={borrowingsColumns}
            pagination={{
              currentPage: borrowingsPagination.state.page,
              totalPages: Math.ceil(borrowings.length / borrowingsPagination.state.limit),
              hasNextPage: borrowingsPagination.state.page < Math.ceil(borrowings.length / borrowingsPagination.state.limit),
              hasPreviousPage: borrowingsPagination.state.page > 1,
              total: borrowings.length,
              pageSize: borrowingsPagination.state.limit
            }}
            sorting={{
              sortBy: borrowingsPagination.state.sortBy,
              sortOrder: borrowingsPagination.state.sortOrder
            }}
            onPageChange={borrowingsPagination.goToPage}
            onSort={handleBorrowingsSort}
            loading={loading}
            emptyMessage="No borrowed books"
          />
        )}

        {/* Pending Requests Table */}
        {activeTab === 'pending' && (
          <PaginatedTable
            data={pendingRequests}
            columns={requestsColumns}
            pagination={{
              currentPage: requestsPagination.state.page,
              totalPages: Math.ceil(pendingRequests.length / requestsPagination.state.limit),
              hasNextPage: requestsPagination.state.page < Math.ceil(pendingRequests.length / requestsPagination.state.limit),
              hasPreviousPage: requestsPagination.state.page > 1,
              total: pendingRequests.length,
              pageSize: requestsPagination.state.limit
            }}
            sorting={{
              sortBy: requestsPagination.state.sortBy,
              sortOrder: requestsPagination.state.sortOrder
            }}
            onPageChange={requestsPagination.goToPage}
            onSort={handleRequestsSort}
            loading={loading}
            emptyMessage="No pending requests"
          />
        )}

        {/* Return Book Modal */}
        {showReturnModal && selectedBorrowing && (
          <div className="my-borrowings-modal-overlay" onClick={() => setShowReturnModal(false)}>
            <div className="my-borrowings-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="my-borrowings-modal-title">Return Book</h3>
              <div className="my-borrowings-modal-content">
                <p>Are you sure you want to return <strong>{selectedBorrowing.book?.title}</strong>?</p>
                
                {selectedBorrowing.lateFeeAmount > 0 && (
                  <div className="my-borrowings-late-fee-warning">
                    <p><strong>Late Fee: ${selectedBorrowing.lateFeeAmount.toFixed(2)}</strong></p>
                    <p>This book is overdue. The late fee will be applied to your account.</p>
                  </div>
                )}
                
                <div className="my-borrowings-modal-field">
                  <label>Notes (Optional):</label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Add any notes about the book condition..."
                    rows={3}
                    className="my-borrowings-modal-textarea"
                  />
                </div>
              </div>
              <div className="my-borrowings-modal-actions">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnNotes('');
                    setSelectedBorrowing(null);
                  }}
                  className="my-borrowings-modal-btn my-borrowings-modal-btn-cancel"
                  disabled={returningUuid === selectedBorrowing.uuid}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnBook}
                  className="my-borrowings-modal-btn my-borrowings-modal-btn-confirm"
                  disabled={returningUuid === selectedBorrowing.uuid}
                >
                  {returningUuid === selectedBorrowing.uuid ? 'Returning...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Request Modal */}
        {showViewModal && selectedRequest && (
          <div className="my-borrowings-modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="my-borrowings-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="my-borrowings-modal-title">Request Details</h3>
              <div className="my-borrowings-modal-content">
                {/* Book Cover */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <img 
                    src={getBookCoverUrl(selectedRequest.book)} 
                    alt={selectedRequest.book?.title}
                    style={{ maxWidth: '150px', borderRadius: '8px' }}
                  />
                </div>
                
                <div className="my-borrowings-modal-info">
                  <strong>Book:</strong> {selectedRequest.book?.title}
                </div>
                <div className="my-borrowings-modal-info">
                  <strong>Author:</strong> {selectedRequest.book?.author}
                </div>
                <div className="my-borrowings-modal-info">
                  <strong>Requested:</strong> {formatDate(selectedRequest.requestedAt)}
                </div>
                <div className="my-borrowings-modal-info">
                  <strong>Duration:</strong> {selectedRequest.requestedDays} days
                </div>
                <div className="my-borrowings-modal-info">
                  <strong>Status:</strong> <span className={`my-borrowings-status-badge ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status.toUpperCase()}
                  </span>
                </div>
                {selectedRequest.rejectionReason && (
                  <div className="my-borrowings-modal-info">
                    <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                  </div>
                )}
              </div>
              <div className="my-borrowings-modal-actions">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="my-borrowings-modal-btn my-borrowings-modal-btn-cancel"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Request Modal */}
        {showCancelModal && selectedRequest && (
          <div className="my-borrowings-modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="my-borrowings-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="my-borrowings-modal-title">Cancel Request</h3>
              <div className="my-borrowings-modal-content">
                <p>Are you sure you want to cancel your request for <strong>{selectedRequest.book?.title}</strong>?</p>
                <p>This action cannot be undone. You can create a new request later if needed.</p>
              </div>
              <div className="my-borrowings-modal-actions">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedRequest(null);
                  }}
                  className="my-borrowings-modal-btn my-borrowings-modal-btn-cancel"
                  disabled={cancellingUuid === selectedRequest.uuid}
                >
                  No, Keep It
                </button>
                <button
                  onClick={confirmCancelRequest}
                  className="my-borrowings-modal-btn my-borrowings-modal-btn-danger"
                  disabled={cancellingUuid === selectedRequest.uuid}
                >
                  {cancellingUuid === selectedRequest.uuid ? 'Cancelling...' : 'Yes, Cancel Request'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
