import { useState, useEffect } from 'react';
import { usePagination } from '../../hooks/usePagination';
import PaginatedTable from '../table/PaginatedTable';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationResponse {
  data: Book[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  links: {
    first: string;
    previous?: string;
    next?: string;
    last: string;
  };
}

export default function PaginatedBooksTable() {
  const pagination = usePagination(5); // Start with 5 books per page
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.state.page.toString(),
        limit: pagination.state.limit.toString(),
        sortBy: pagination.state.sortBy,
        sortOrder: pagination.state.sortOrder,
        ...(pagination.state.search && { search: pagination.state.search }),
        ...(authorFilter && { author: authorFilter }),
        ...(yearFilter && { publishedYear: yearFilter })
      });

      const response = await fetch(`${API_BASE}/books?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginationResponse = await response.json();
      setBooks(result.data);
      pagination.updatePagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        hasNextPage: result.meta.hasNextPage,
        hasPreviousPage: result.meta.hasPreviousPage
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [
    pagination.state.page, 
    pagination.state.limit, 
    pagination.state.sortBy, 
    pagination.state.sortOrder,
    pagination.state.search,
    authorFilter,
    yearFilter
  ]);

  const getStatusBadge = (book: Book) => {
    const isNew = new Date(book.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (isNew) {
      return (
        <span style={{
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: '600',
          backgroundColor: '#dcfce7',
          color: '#16a34a',
          border: '1px solid #bbf7d0'
        }}>
          NEW
        </span>
      );
    }
    return null;
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (book: Book) => (
        <div>
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
            {book.title}
          </div>
          {getStatusBadge(book)}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      sortable: true,
      width: '200px',
      render: (book: Book) => (
        <div style={{ fontWeight: '500', color: '#374151' }}>
          {book.author}
        </div>
      )
    },
    {
      key: 'isbn',
      label: 'ISBN',
      width: '140px',
      render: (book: Book) => (
        <code style={{
          backgroundColor: '#f3f4f6',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          {book.isbn}
        </code>
      )
    },
    {
      key: 'publishedYear',
      label: 'Year',
      sortable: true,
      width: '80px',
      render: (book: Book) => (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          {book.publishedYear || '—'}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      width: '120px',
      render: (book: Book) => (
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {new Date(book.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (book: Book) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('View book:', book.id)}
          >
            View
          </button>
          <button
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('Edit book:', book.id)}
          >
            Edit
          </button>
          <button
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('Delete book:', book.id)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Error loading books</h3>
        <p style={{ margin: 0 }}>{error}</p>
        <button
          onClick={fetchBooks}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>Book Library</h2>
        
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={pagination.state.search}
            onChange={(e) => pagination.updateSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Author Filter */}
        <input
          type="text"
          placeholder="Filter by author"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        />

        {/* Year Filter */}
        <input
          type="number"
          placeholder="Year"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '100px'
          }}
        />

        {/* Page Size Selector */}
        <select
          value={pagination.state.limit}
          onChange={(e) => pagination.changePageSize(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>

        {/* Clear Filters */}
        {(authorFilter || yearFilter || pagination.state.search) && (
          <button
            onClick={() => {
              setAuthorFilter('');
              setYearFilter('');
              pagination.updateSearch('');
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <PaginatedTable
        data={books}
        columns={columns}
        pagination={{
          currentPage: pagination.state.page,
          totalPages: pagination.state.totalPages,
          hasNextPage: pagination.state.hasNextPage,
          hasPreviousPage: pagination.state.hasPreviousPage,
          total: pagination.state.total,
          pageSize: pagination.state.limit
        }}
        sorting={{
          sortBy: pagination.state.sortBy,
          sortOrder: pagination.state.sortOrder
        }}
        onPageChange={pagination.goToPage}
        onSort={pagination.updateSort}
        loading={loading}
        emptyMessage="No books found matching your criteria"
      />
    </div>
  );
}