import { useState, useEffect } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';

interface Props {
  bookUuid: string;
  bookTitle: string;
}

export function BorrowRequestButton({ bookUuid, bookTitle }: Props) {
  const { requestBorrow, requests, borrowings, checkBookAvailability } = useBorrowing();
  
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(14);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityInfo, setAvailabilityInfo] = useState<any>(null);

  // Check if user already has pending request for this book
  const hasPendingRequest = requests.some(
    (req) => req.book?.uuid === bookUuid && req.status === 'pending'
  );

  // Check if user currently has this book borrowed
  const isCurrentlyBorrowed = borrowings.some(
    (borrow) => borrow.book?.uuid === bookUuid && borrow.status !== 'returned'
  );

  // Check book availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const info = await checkBookAvailability(bookUuid);
        setAvailabilityInfo(info);
        setIsAvailable(info.isAvailable);
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    };

    checkAvailability();
  }, [bookUuid]);

  const handleRequest = async () => {
    try {
      setLoading(true);
      await requestBorrow(bookUuid, days);
      alert(`Borrow request submitted for "${bookTitle}"!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentlyBorrowed) {
    return (
      <div className="borrow-status">
        <span className="badge badge-info">You currently have this book</span>
      </div>
    );
  }

  if (hasPendingRequest) {
    return (
      <div className="borrow-status">
        <span className="badge badge-warning">Request Pending</span>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="borrow-status">
        <button disabled className="btn btn-disabled">
          Currently Unavailable
        </button>
        {availabilityInfo && (
          <p className="text-sm text-gray-500 mt-1">
            {availabilityInfo.activeBorrowings} of {availabilityInfo.totalCopies} copies borrowed
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="borrow-request-form space-y-3">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Borrow Duration:</span>
        </label>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="select select-bordered w-full"
        >
          <option value={7}>1 week (7 days)</option>
          <option value={14}>2 weeks (14 days)</option>
          <option value={21}>3 weeks (21 days)</option>
          <option value={30}>1 month (30 days)</option>
        </select>
      </div>

      <button
        onClick={handleRequest}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Requesting...' : 'Request to Borrow'}
      </button>

      {availabilityInfo && (
        <div className="text-xs text-gray-500">
          <p>{availabilityInfo.availableCopies} of {availabilityInfo.totalCopies} copies available</p>
          {availabilityInfo.totalBorrowings > 0 && (
            <p>Avg. borrow time: {availabilityInfo.averageBorrowDays} days</p>
          )}
        </div>
      )}
    </div>
  );
}
