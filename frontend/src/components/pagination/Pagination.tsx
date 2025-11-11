import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  total?: number;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  showPageNumbers = true,
  maxVisiblePages = 5,
  total,
  pageSize
}: PaginationProps) {
  const getVisiblePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = Math.floor(maxVisiblePages / 2);
    let rangeStart = Math.max(1, currentPage - delta);
    let rangeEnd = Math.min(totalPages, rangeStart + maxVisiblePages - 1);
    
    // Adjust range if we're near the end
    if (rangeEnd - rangeStart + 1 < maxVisiblePages) {
      rangeStart = Math.max(1, rangeEnd - maxVisiblePages + 1);
    }
    
    return Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, i) => rangeStart + i
    );
  };

  const visiblePages = getVisiblePageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container">
      {/* Pagination Controls */}
      <div className="pagination-controls">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? 'pagination-button-disabled' : 'pagination-button'}
          title="First page"
        >
          ⟪
        </button>

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={!hasPreviousPage ? 'pagination-button-disabled' : 'pagination-button'}
          title="Previous page"
        >
          ⟨
        </button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <>
            {/* Show ellipsis if there are hidden pages at the beginning */}
            {visiblePages[0] > 1 && (
              <>
                {visiblePages[0] > 2 && (
                  <span className="pagination-ellipsis">…</span>
                )}
              </>
            )}

            {visiblePages.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={pageNum === currentPage ? 'pagination-button-active' : 'pagination-button'}
                title={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            ))}

            {/* Show ellipsis if there are hidden pages at the end */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span className="pagination-ellipsis">…</span>
                )}
              </>
            )}
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={!hasNextPage ? 'pagination-button-disabled' : 'pagination-button'}
          title="Next page"
        >
          ⟩
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={currentPage === totalPages ? 'pagination-button-disabled' : 'pagination-button'}
          title="Last page"
        >
          ⟫
        </button>
      </div>

      {/* Page Info */}
      <div className="pagination-info">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        {total && pageSize && (
          <span>
            Showing {Math.min((currentPage - 1) * pageSize + 1, total)} to {Math.min(currentPage * pageSize, total)} of {total} results
          </span>
        )}
      </div>
    </div>
  );
}