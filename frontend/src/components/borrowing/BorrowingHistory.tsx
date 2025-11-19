import { useEffect } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';
import { BorrowingCard } from './BorrowingCard';

export function BorrowingHistory() {
  const { history, loading, error, refreshHistory } = useBorrowing();

  useEffect(() => {
    refreshHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {error}</span>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="hero min-h-[400px] bg-base-200 rounded-lg">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold">No Borrowing History</h2>
            <p className="py-6">
              You haven't returned any books yet. Your borrowing history will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="borrowing-history-page">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Borrowing History</h2>
        <button onClick={refreshHistory} className="btn btn-outline btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="stats shadow w-full mb-6">
        <div className="stat">
          <div className="stat-title">Total Returned</div>
          <div className="stat-value">{history.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Books with Late Fees</div>
          <div className="stat-value text-warning">
            {history.filter(h => h.lateFeeAmount > 0).length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Total Late Fees Paid</div>
          <div className="stat-value text-error">
            ${history.reduce((sum, h) => sum + h.lateFeeAmount, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((borrowing) => (
          <BorrowingCard key={borrowing.uuid} borrowing={borrowing} />
        ))}
      </div>
    </div>
  );
}
