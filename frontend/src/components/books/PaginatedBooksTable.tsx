import { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import PaginatedTable from '../table/PaginatedTable';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  buttonDanger: {
    padding: '8px 16px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '5px',
  },
  buttonSecondary: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: '5px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
  },
  modal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280',
  },
  actions: {
    display: 'flex',
    gap: '5px',
  },
};

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
  publisher: string;
  publishedYear: number;
  totalCopies: number;
  location: string;
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
  const pagination = usePagination(5); // Start with 5 books per page
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
    publisher: "",
    publishedYear: 0,
    totalCopies: 0,
    location: "",
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
      publisher: "",
      publishedYear: 0,
      totalCopies: 0,
      location: "",
    });
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publisher: "", // Note: Book interface doesn't have these fields, using defaults
      publishedYear: book.publishedYear || 0,
      totalCopies: 0,
      location: "",
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
          <div style={{ fontWeight: '600', marginBottom: '2px' }}>
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
        <div style={styles.actions}>
          <button
            style={styles.buttonSecondary}
            onClick={() => openViewModal(book)}
          >
            View
          </button>
          {userRole === 'admin' && (
            <button
              style={styles.buttonSecondary}
              onClick={() => openEditModal(book)}
            >
              Edit
            </button>
          )}
          {userRole === 'admin' && (
            <button
              style={styles.buttonDanger}
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Books Library</h1>
        <div>
          {userRole && (
            <span style={{ marginRight: '1rem', color: '#6b7280', fontSize: '14px' }}>
              Role: <strong>{userRole}</strong>
            </span>
          )}
          {userRole === 'admin' ? (
            <button
              style={styles.button}
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Add New Book
            </button>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
              Admin access required to manage books
            </span>
          )}
        </div>
      </div>

      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search books by title, author, or ISBN..."
            value={pagination.state.search}
            onChange={(e) => pagination.updateSearch(e.target.value)}
            style={{
              width: '80%',
              padding: '8px 12px',
              margin: '0px 0px 0px 30px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
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

      {/* Add Book Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Add New Book</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter book title"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Author</label>
              <input
                style={styles.input}
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Enter author name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ISBN</label>
              <input
                style={styles.input}
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
                placeholder="Enter ISBN (13 digits)"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Publisher</label>
              <input
                style={styles.input}
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
                placeholder="Enter publisher name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Published Year</label>
              <input
                style={styles.input}
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
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Copies</label>
              <input
                style={styles.input}
                type="number"
                value={formData.totalCopies?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
                placeholder="Enter total copies"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                style={styles.input}
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Enter shelf location"
              />
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleCreate}>
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Edit Book</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Author</label>
              <input
                style={styles.input}
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ISBN</label>
              <input
                style={styles.input}
                type="text"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Publisher</label>
              <input
                style={styles.input}
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Published Year</label>
              <input
                style={styles.input}
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
            <div style={styles.formGroup}>
              <label style={styles.label}>Total Copies</label>
              <input
                style={styles.input}
                type="number"
                value={formData.totalCopies?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalCopies: e.target.value ? parseInt(e.target.value) : 0,
                  })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                style={styles.input}
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleUpdate}>
                Update Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Book Details</h2>
            <div style={styles.formGroup}>
              <strong>Title:</strong> {selectedBook.title}
            </div>
            <div style={styles.formGroup}>
              <strong>Author:</strong> {selectedBook.author}
            </div>
            <div style={styles.formGroup}>
              <strong>ISBN:</strong> {selectedBook.isbn}
            </div>
            <div style={styles.formGroup}>
              <strong>Published Year:</strong> {selectedBook.publishedYear || "Unknown"}
            </div>
            <div style={styles.formGroup}>
              <strong>Created:</strong> {new Date(selectedBook.createdAt).toLocaleDateString()}
            </div>
            <div style={styles.formGroup}>
              <strong>Updated:</strong> {new Date(selectedBook.updatedAt).toLocaleDateString()}
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.button}
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
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Delete Book</h2>
            <p>
              Are you sure you want to delete "<strong>{selectedBook.title}</strong>"?
              This action cannot be undone.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button style={styles.buttonDanger} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}