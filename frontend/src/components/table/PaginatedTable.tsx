import Pagination from '../pagination/Pagination';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    total: number;
    pageSize: number;
  };
  sorting: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onPageChange: (page: number) => void;
  onSort: (column: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function PaginatedTable<T>({
  data,
  columns,
  pagination,
  sorting,
  onPageChange,
  onSort,
  loading = false,
  emptyMessage = 'No data available'
}: PaginatedTableProps<T>) {
  const getSortIcon = (columnKey: string) => {
    if (sorting.sortBy !== columnKey) {
      return <span style={{ color: '#d1d5db', marginLeft: '4px' }}>↕</span>;
    }
    return (
      <span style={{ marginLeft: '4px', color: '#3b82f6' }}>
        {sorting.sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    position: 'relative' as const
  };

  const thStyle = {
    backgroundColor: '#f9fafb',
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    userSelect: 'none' as const
  };

  const sortableThStyle = {
    ...thStyle,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    verticalAlign: 'top' as const
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Add CSS for hover effects */}
      <style>{`
        .sortable-header:hover {
          background-color: #f3f4f6 !important;
        }
        .table-row:hover {
          background-color: #f9fafb !important;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                onClick={() => column.sortable && onSort(column.key)}
                className={column.sortable ? 'sortable-header' : undefined}
                style={{
                  ...(column.sortable ? sortableThStyle : thStyle),
                  width: column.width
                }}
                title={column.sortable ? `Sort by ${column.label}` : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  ...tdStyle,
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="table-row"
              >
                {columns.map(column => (
                  <td
                    key={column.key}
                    style={{
                      ...tdStyle,
                      width: column.width
                    }}
                  >
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        hasNextPage={pagination.hasNextPage}
        hasPreviousPage={pagination.hasPreviousPage}
        onPageChange={onPageChange}
        total={pagination.total}
        pageSize={pagination.pageSize}
      />
    </div>
  );
}