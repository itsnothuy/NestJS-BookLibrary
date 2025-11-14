import { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import PaginatedTable from '../table/PaginatedTable';
import './PaginatedBooksTable.css';

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

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  
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
  const { token } = useAuth();
  const pagination = usePagination(10); // Start with 10 books page
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  
  // CRUD Modal states
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    publishedYear: 0,
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Fetch user profile to get role
  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const profile = await response.json();
        setUserRole(profile.role);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Create book
  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can create books. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create book");
      }
      
      await fetchBooks();
      setShowAddModal(false);
      resetForm();
      alert("Book created successfully!");
    } catch (error: any) {
      console.error("Error creating book:", error);
      alert(error.message || "Failed to create book. Please try again.");
    }
  };

  // Update book
  const handleUpdate = async () => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can edit books. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update book");
      }
      
      await fetchBooks();
      setShowEditModal(false);
      resetForm();
      alert("Book updated successfully!");
    } catch (error: any) {
      console.error("Error updating book:", error);
      alert(error.message || "Failed to update book. Please try again.");
    }
  };

  // Delete book
  const handleDelete = async () => {
    if (!selectedBook) return;
    try {
      const response = await fetch(`${API_BASE}/books/${selectedBook.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can delete books. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete book");
      }
      
      await fetchBooks();
      setShowDeleteModal(false);
      setSelectedBook(null);
      alert("Book deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting book:", error);
      alert(error.message || "Failed to delete book. Please try again.");
    }
  };

  // Modal helper functions
  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      publishedYear: 0,
    });
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear || 0,
    });
    setShowEditModal(true);
  };

  const openViewModal = (book: Book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const openDeleteModal = (book: Book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    fetchBooks();
    fetchUserProfile();
  }, [
    pagination.state.page, 
    pagination.state.limit, 
    pagination.state.sortBy, 
    pagination.state.sortOrder,
    pagination.state.search,
    authorFilter,
    yearFilter
  ]);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (book: Book) => (
        <div>
          <div className="paginated-books-title-cell">
            {book.title}
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      sortable: true,
      width: '200px',
      render: (book: Book) => (
        <div className="paginated-books-author-cell">
          {book.author}
        </div>
      )
    },
    {
      key: 'isbn',
      label: 'ISBN',
      width: '140px',
      render: (book: Book) => (
        <code className="paginated-books-isbn-cell">
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
        <div className="paginated-books-year-cell">
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
        <div className="paginated-books-date-cell">
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
        <div className="paginated-books-actions">
          <button
            className="paginated-books-button-secondary"
            onClick={() => openViewModal(book)}
          >
            View
          </button>
          {userRole === 'admin' && (
            <button
              className="paginated-books-button-secondary"
              onClick={() => openEditModal(book)}
            >
              Edit
            </button>
          )}
          {userRole === 'admin' && (
            <button
              className="paginated-books-button-danger"
              onClick={() => openDeleteModal(book)}
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="paginated-books-error">
        <h3>Error loading books</h3>
        <p>{error}</p>
        <button
          onClick={fetchBooks}
          className="paginated-books-retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="paginated-books-container">
      <div className="paginated-books-header">
        <h2 className="paginated-books-title">Books Library</h2>
        
        {/* Book Role Display and Add Button */}
        <div className="paginated-books-controls">
          {userRole && (
            <span className="paginated-books-role-display">
              Role: <strong>{userRole}</strong>
            </span>
          )}
          {userRole === 'admin' ? (
            <button
              className="paginated-books-button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Add New Book
            </button>
          ) : (
            <span className="paginated-books-admin-message">
              Admin access required to manage books
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <div className="paginated-books-search-container">
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={pagination.state.search}
            onChange={(e) => pagination.updateSearch(e.target.value)}
            className="paginated-books-search-input"
          />
        </div>


        {/* Clear Filters */}
        {(authorFilter || yearFilter || pagination.state.search) && (
          <button
            onClick={() => {
              setAuthorFilter('');
              setYearFilter('');
              pagination.updateSearch('');
            }}
            className="paginated-books-clear-filters"
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

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="paginated-books-modal">
          <div className="paginated-books-modal-content">
            <h2>Add New Book</h2>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Title</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter book title"
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Author</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Enter author name"
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">ISBN</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Enter ISBN (13 digits)"
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Published Year</label>
              <input
                className="paginated-books-input"
                type="number"
                value={formData.publishedYear?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedYear: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                placeholder="Enter published year"
              />
            </div>
            <div className="paginated-books-modal-buttons">
              <button
                className="paginated-books-button-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-books-button" onClick={handleCreate}>
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="paginated-books-modal">
          <div className="paginated-books-modal-content">
            <h2>Edit Book</h2>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Title</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Author</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">ISBN</label>
              <input
                className="paginated-books-input"
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
              />
            </div>
            <div className="paginated-books-form-group">
              <label className="paginated-books-label">Published Year</label>
              <input
                className="paginated-books-input"
                type="number"
                value={formData.publishedYear?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedYear: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
              />
            </div>
            <div className="paginated-books-modal-buttons">
              <button
                className="paginated-books-button-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-books-button" onClick={handleUpdate}>
                Update Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="paginated-books-modal">
          <div className="paginated-books-modal-content">
            <h2>Book Details</h2>
            <div className="paginated-books-form-group">
              <strong>Title:</strong> {selectedBook.title}
            </div>
            <div className="paginated-books-form-group">
              <strong>Author:</strong> {selectedBook.author}
            </div>
            <div className="paginated-books-form-group">
              <strong>ISBN:</strong> {selectedBook.isbn}
            </div>
            <div className="paginated-books-form-group">
              <strong>Published Year:</strong> {selectedBook.publishedYear || "Unknown"}
            </div>
            <div className="paginated-books-modal-buttons">
              <button
                className="paginated-books-button"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBook && (
        <div className="paginated-books-modal">
          <div className="paginated-books-modal-content">
            <h2>Delete Book</h2>
            <p>
              Are you sure you want to delete "<strong>{selectedBook.title}</strong>"?
              This action cannot be undone.
            </p>
            <div className="paginated-books-modal-buttons">
              <button
                className="paginated-books-button-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-books-button-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}