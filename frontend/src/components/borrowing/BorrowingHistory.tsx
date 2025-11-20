import { useEffect, useMemo } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';
import Header from '../layout/Header';
import NavTab from '../layout/NavTab';
import PaginatedTable from '../table/PaginatedTable';
import { usePagination } from '../../hooks/usePagination';
import './BorrowingHistory.css';

export function BorrowingHistory() {
  const { history, loading, error, refreshHistory } = useBorrowing();
  const pagination = usePagination(10);

  useEffect(() => {
    refreshHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateBorrowDuration = (borrowedAt: string, returnedAt: string) => {
    const borrowed = new Date(borrowedAt);
    const returned = new Date(returnedAt);
    const days = Math.ceil((returned.getTime() - borrowed.getTime()) / (1000 * 60 * 60 * 24));
    return days;
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
        <div className="borrowing-history-book-cell">
          <div className="borrowing-history-book-title">{borrowing.book?.title || 'Unknown'}</div>
          <div className="borrowing-history-book-author">{borrowing.book?.author || 'Unknown Author'}</div>
        </div>
      )
    },
    {
      key: 'borrowedAt',
      label: 'Borrowed Date',
      sortable: true,
      width: '130px',
      render: (borrowing: any) => (
        <div className="borrowing-history-date-cell">
          {formatDate(borrowing.borrowedAt)}
        </div>
      )
    },
    {
      key: 'returnedAt',
      label: 'Returned Date',
      sortable: true,
      width: '130px',
      render: (borrowing: any) => (
        <div className="borrowing-history-date-cell">
          {borrowing.returnedAt ? formatDate(borrowing.returnedAt) : 'Not returned'}
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      width: '100px',
      render: (borrowing: any) => (
        <div className="borrowing-history-duration-cell">
          {borrowing.returnedAt ? (
            <span>{calculateBorrowDuration(borrowing.borrowedAt, borrowing.returnedAt)} days</span>
          ) : (
            <span>-</span>
          )}
        </div>
      )
    },
    {
      key: 'lateFee',
      label: 'Late Fee',
      sortable: true,
      width: '100px',
      render: (borrowing: any) => (
        <div className="borrowing-history-fee-cell">
          {borrowing.lateFeeAmount > 0 ? (
            <span className="borrowing-history-fee-amount">${borrowing.lateFeeAmount.toFixed(2)}</span>
          ) : (
            <span className="borrowing-history-no-fee">$0.00</span>
          )}
        </div>
      )
    }
  ], []);

  if (loading) {
    return (
      <>
        <Header />
        <NavTab activeTab="borrowing-history" setActiveTab={() => {}} />
        <div className="borrowing-history-container">
          <div className="borrowing-history-loading">
            <span className="loading loading-spinner loading-lg"></span>
            <span>Loading your borrowing history...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <NavTab activeTab="borrowing-history" setActiveTab={() => {}} />
        <div className="borrowing-history-container">
          <div className="borrowing-history-error">
            <h3>Error Loading History</h3>
            <p>{error}</p>
            <button onClick={refreshHistory} className="borrowing-history-retry-button">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (history.length === 0) {
    return (
      <>
        <Header />
        <NavTab activeTab="borrowing-history" setActiveTab={() => {}} />
        <div className="borrowing-history-container">
          <div className="borrowing-history-empty">
            <h2>No Borrowing History</h2>
            <p>You haven't returned any books yet. Your borrowing history will appear here.</p>
            <a href="/student/books" className="borrowing-history-browse-button">
              Return to Book Gallery
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <NavTab activeTab="borrowing-history" setActiveTab={() => {}} />
      <div className="borrowing-history-container">
        <div className="borrowing-history-header">
          <h2 className="borrowing-history-title">Borrowing History</h2>
          <button onClick={refreshHistory} className="borrowing-history-refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="borrowing-history-stats">
          <div className="borrowing-history-stat-card">
            <div className="borrowing-history-stat-icon borrowing-history-stat-icon-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="borrowing-history-stat-content">
              <div className="borrowing-history-stat-label">Total Returned</div>
              <div className="borrowing-history-stat-value">{history.length}</div>
            </div>
          </div>

          <div className="borrowing-history-stat-card">
            <div className="borrowing-history-stat-icon borrowing-history-stat-icon-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="borrowing-history-stat-content">
              <div className="borrowing-history-stat-label">Books with Late Fees</div>
              <div className="borrowing-history-stat-value borrowing-history-stat-value-warning">
                {history.filter(h => h.lateFeeAmount > 0).length}
              </div>
            </div>
          </div>

          <div className="borrowing-history-stat-card">
            <div className="borrowing-history-stat-icon borrowing-history-stat-icon-danger">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="borrowing-history-stat-content">
              <div className="borrowing-history-stat-label">Total Late Fees Paid</div>
              <div className="borrowing-history-stat-value borrowing-history-stat-value-danger">
                ${history.reduce((sum, h) => sum + h.lateFeeAmount, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <PaginatedTable
          data={history}
          columns={columns}
          pagination={{
            currentPage: pagination.state.page,
            totalPages: Math.ceil(history.length / pagination.state.limit),
            hasNextPage: pagination.state.page < Math.ceil(history.length / pagination.state.limit),
            hasPreviousPage: pagination.state.page > 1,
            total: history.length,
            pageSize: pagination.state.limit
          }}
          sorting={{
            sortBy: pagination.state.sortBy,
            sortOrder: pagination.state.sortOrder
          }}
          onPageChange={pagination.goToPage}
          onSort={handleSort}
          loading={loading}
          emptyMessage="No borrowing history"
        />
      </div>
    </>
  );
}
