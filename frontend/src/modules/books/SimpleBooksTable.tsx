import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE;

// Types
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
  publishedYear: number | null;
}

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

export default function SimpleBooksTable() {
  const { token } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    publishedYear: null,
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books`);
      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      alert("Failed to fetch books. Please try again.");
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

  useEffect(() => {
    fetchBooks();
    fetchUserProfile();
  }, [token]);

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

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      publishedYear: null,
    });
    setSelectedBook(null);
  };

  const openEditModal = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
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

      {loading ? (
        <div style={styles.loading}>Loading books...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Author</th>
              <th style={styles.th}>ISBN</th>
              <th style={styles.th}>Published Year</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: '#6b7280' }}>
                  No books found. Add your first book!
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <td style={styles.td}>{book.title}</td>
                  <td style={styles.td}>{book.author}</td>
                  <td style={styles.td}>{book.isbn}</td>
                  <td style={styles.td}>{book.publishedYear || "Unknown"}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.buttonSecondary}
                        onClick={() => openViewModal(book)}
                      >
                        View
                      </button>
                      {userRole === 'admin' && (
                        <>
                          <button
                            style={styles.buttonSecondary}
                            onClick={() => openEditModal(book)}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.buttonDanger}
                            onClick={() => openDeleteModal(book)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

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
              <label style={styles.label}>Published Year</label>
              <input
                style={styles.input}
                type="number"
                value={formData.publishedYear?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedYear: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Enter published year"
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
              <label style={styles.label}>Published Year</label>
              <input
                style={styles.input}
                type="number"
                value={formData.publishedYear?.toString() || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedYear: e.target.value ? parseInt(e.target.value) : null,
                  })
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