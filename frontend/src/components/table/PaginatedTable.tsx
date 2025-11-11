import Pagination from '../pagination/Pagination';
import './PaginatedTable.css';

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
      return <span className="paginated-table-sort-icon-inactive">↕</span>;
    }
    return (
      <span className="paginated-table-sort-icon-active">
        {sorting.sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="paginated-table-container">
      {/* Loading Overlay */}
      {loading && (
        <div className="paginated-table-loading-overlay">
          <div className="paginated-table-loading-content">
            <div className="paginated-table-loading-spinner" />
            <span className="paginated-table-loading-text">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="paginated-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                onClick={() => column.sortable && onSort(column.key)}
                className={column.sortable ? 'paginated-table-th-sortable' : 'paginated-table-th'}
                style={{ width: column.width }}
                title={column.sortable ? `Sort by ${column.label}` : undefined}
              >
                <div className="paginated-table-th-content">
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
                className="paginated-table-td-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className="paginated-table-row"
              >
                {columns.map(column => (
                  <td
                    key={column.key}
                    className="paginated-table-td"
                    style={{ width: column.width }}
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