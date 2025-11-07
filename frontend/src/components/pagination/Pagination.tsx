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

  const buttonStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    minWidth: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f9fafb',
    color: '#9ca3af',
    cursor: 'not-allowed',
    borderColor: '#e5e7eb'
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      margin: '24px 0'
    }}>
      {/* Pagination Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledButtonStyle : buttonStyle}
          title="First page"
        >
          ⟪
        </button>

        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          style={!hasPreviousPage ? disabledButtonStyle : buttonStyle}
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
                  <span style={{ padding: '0 8px', color: '#6b7280' }}>…</span>
                )}
              </>
            )}

            {visiblePages.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={pageNum === currentPage ? activeButtonStyle : buttonStyle}
                title={`Page ${pageNum}`}
              >
                {pageNum}
              </button>
            ))}

            {/* Show ellipsis if there are hidden pages at the end */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <span style={{ padding: '0 8px', color: '#6b7280' }}>…</span>
                )}
              </>
            )}
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          style={!hasNextPage ? disabledButtonStyle : buttonStyle}
          title="Next page"
        >
          ⟩
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledButtonStyle : buttonStyle}
          title="Last page"
        >
          ⟫
        </button>
      </div>

      {/* Page Info */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
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