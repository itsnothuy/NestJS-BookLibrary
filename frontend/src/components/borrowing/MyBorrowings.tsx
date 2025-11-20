import { useEffect, useMemo } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';
import Header from '../layout/Header';
import NavTab from '../layout/NavTab';
import PaginatedTable from '../table/PaginatedTable';
import { usePagination } from '../../hooks/usePagination';
import './MyBorrowings.css';

export function MyBorrowings() {
  const { borrowings, loading, error, refreshBorrowings } = useBorrowing();
  const pagination = usePagination(10);

  useEffect(() => {
    refreshBorrowings();
  }, []);

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
      returned: 'my-borrowings-status-returned'
    };
    return statusColors[status] || 'my-borrowings-status-default';
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleSort = (columnKey: string) => {
    const newOrder = pagination.state.sortBy === columnKey && pagination.state.sortOrder === 'asc' ? 'desc' : 'asc';
    pagination.updateSort(columnKey, newOrder);
  };

  const columns = useMemo(() => [
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
    }
  ], []);

  if (loading) {
    return (
      <>
        <Header />
        <NavTab activeTab="my-borrowings" setActiveTab={() => {}} />
        <div className="my-borrowings-container">
          <div className="my-borrowings-loading">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading your borrowings...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <NavTab activeTab="my-borrowings" setActiveTab={() => {}} />
        <div className="my-borrowings-container">
          <div className="my-borrowings-error">
            <h3>Error Loading Borrowings</h3>
            <p>{error}</p>
            <button onClick={refreshBorrowings} className="my-borrowings-retry-button">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (borrowings.length === 0) {
    return (
      <>
        <Header />
        <NavTab activeTab="my-borrowings" setActiveTab={() => {}} />
        <div className="my-borrowings-container">
          <div className="my-borrowings-empty">
            <h2>No Borrowed Books</h2>
            <p>You don't have any borrowed books at the moment. Browse our collection and request to borrow a book!</p>
            <a href="/student/books" className="my-borrowings-browse-button">
              Browse Books
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <NavTab activeTab="my-borrowings" setActiveTab={() => {}} />
      <div className="my-borrowings-container">
        <div className="my-borrowings-header">
          <h2 className="my-borrowings-title">My Borrowed Books</h2>
          <button onClick={refreshBorrowings} className="my-borrowings-refresh-button">
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
              <div className="my-borrowings-stat-label">Total Borrowed</div>
              <div className="my-borrowings-stat-value">{borrowings.length}</div>
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

          <div className="my-borrowings-stat-card">
            <div className="my-borrowings-stat-icon my-borrowings-stat-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="my-borrowings-stat-content">
              <div className="my-borrowings-stat-label">Total Late Fees</div>
              <div className="my-borrowings-stat-value my-borrowings-stat-value-warning">
                ${borrowings.reduce((sum, b) => sum + b.lateFeeAmount, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <PaginatedTable
          data={borrowings}
          columns={columns}
          pagination={{
            currentPage: pagination.state.page,
            totalPages: Math.ceil(borrowings.length / pagination.state.limit),
            hasNextPage: pagination.state.page < Math.ceil(borrowings.length / pagination.state.limit),
            hasPreviousPage: pagination.state.page > 1,
            total: borrowings.length,
            pageSize: pagination.state.limit
          }}
          sorting={{
            sortBy: pagination.state.sortBy,
            sortOrder: pagination.state.sortOrder
          }}
          onPageChange={pagination.goToPage}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No borrowed books"
        />
      </div>
    </>
  );
}
