import type { Borrowing } from '../../modules/borrowing/BorrowingContext';

interface Props {
  borrowing: Borrowing;
}

export function BorrowingCard({ borrowing }: Props) {
  const isOverdue = borrowing.status === 'overdue';
  const isReturned = borrowing.status === 'returned';
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilDue = () => {
    const due = new Date(borrowing.dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntilDue = getDaysUntilDue();
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const getCoverUrl = () => {
    if (borrowing.book?.coverImageFilename) {
      return `${API_BASE}/books/cover/${borrowing.book.coverImageFilename}`;
    }
    return '/placeholder-book.png';
  };

  return (
    <div className={`card bg-base-100 shadow-xl ${isOverdue ? 'border-2 border-error' : ''}`}>
      <figure className="px-4 pt-4">
        <img
          src={getCoverUrl()}
          alt={borrowing.book?.title || 'Book cover'}
          className="rounded-xl h-48 w-32 object-cover"
        />
      </figure>
      
      <div className="card-body">
        <h3 className="card-title">{borrowing.book?.title || 'Unknown Title'}</h3>
        <p className="text-sm text-gray-500">{borrowing.book?.author || 'Unknown Author'}</p>
        
        <div className="divider my-2"></div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Borrowed:</span>
            <span>{formatDate(borrowing.borrowedAt)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">Due Date:</span>
            <span className={isOverdue ? 'text-error font-bold' : ''}>
              {formatDate(borrowing.dueDate)}
            </span>
          </div>
          
          {!isReturned && (
            <div className="flex justify-between">
              <span className="font-semibold">Status:</span>
              {isOverdue ? (
                <span className="badge badge-error">
                  {borrowing.daysOverdue} days overdue
                </span>
              ) : (
                <span className="badge badge-success">
                  {daysUntilDue} days left
                </span>
              )}
            </div>
          )}
          
          {borrowing.lateFeeAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-semibold">Late Fee:</span>
              <span className="text-error font-bold">
                ${borrowing.lateFeeAmount.toFixed(2)}
              </span>
            </div>
          )}
          
          {isReturned && borrowing.returnedAt && (
            <div className="flex justify-between">
              <span className="font-semibold">Returned:</span>
              <span>{formatDate(borrowing.returnedAt)}</span>
            </div>
          )}
        </div>
        
        {borrowing.borrowNotes && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 italic">
              Note: {borrowing.borrowNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
