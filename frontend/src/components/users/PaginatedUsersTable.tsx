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
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
};

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null; // BLOB avatar URL
  avatarMimeType: string | null;
  avatarSizeBytes: number | null;
  avatarWidth: number | null;
  avatarHeight: number | null;
  avatarUploadedAt: string | null;
}

interface UserFormData {
  email: string;
  password: string;
  role: 'student' | 'admin';
}

interface PaginationResponse {
  data: User[];
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

export default function PaginatedUsersTable() {
  const { token } = useAuth();
  const pagination = usePagination(5); // Start with 5 users per page
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    role: "student",
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.state.page.toString(),
        limit: pagination.state.limit.toString(),
        sortBy: pagination.state.sortBy,
        sortOrder: pagination.state.sortOrder,
        ...(pagination.state.search && { search: pagination.state.search }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await fetch(`${API_BASE}/users?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginationResponse = await response.json();
      setUsers(result.data);
      pagination.updatePagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        hasNextPage: result.meta.hasNextPage,
        hasPreviousPage: result.meta.hasPreviousPage
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
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
    fetchUsers();
    fetchUserProfile();
  }, [
    pagination.state.page, 
    pagination.state.limit, 
    pagination.state.sortBy, 
    pagination.state.sortOrder,
    pagination.state.search,
    roleFilter,
    token
  ]);

  // Create user
  const handleCreate = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can create users. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }
      
      await fetchUsers();
      setShowAddModal(false);
      resetForm();
      alert("User created successfully!");
    } catch (error: any) {
      console.error("Error creating user:", error);
      alert(error.message || "Failed to create user. Please try again.");
    }
  };

  // Update user
  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const updateData: any = {
        email: formData.email,
        role: formData.role,
      };
      
      // Only include password if it's provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can edit users. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }
      
      await fetchUsers();
      setShowEditModal(false);
      resetForm();
      alert("User updated successfully!");
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(error.message || "Failed to update user. Please try again.");
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 403) {
        alert("Permission denied: Only admin users can delete users. Please log in as an admin.");
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }
      
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      alert("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.message || "Failed to delete user. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      role: "student",
    });
    setSelectedUser(null);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "", // Don't prefill password for security
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const getRoleBadgeStyle = (role: string) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.025em'
    };

    switch (role) {
      case 'admin':
        return {
          ...baseStyle,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        };
      case 'student':
        return {
          ...baseStyle,
          backgroundColor: '#dbeafe',
          color: '#2563eb',
          border: '1px solid #bfdbfe'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
    }
  };

  const AvatarDisplay = ({ user, size = 32 }: { user: User; size?: number }) => {
    if (user.avatarUrl) {
      return (
        <img
          src={`${API_BASE}${user.avatarUrl}`}
          alt={`${user.email}'s avatar`}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e5e7eb'
          }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              const fallback = document.createElement('div');
              const initials = user.email.split('@')[0].substring(0, 2).toUpperCase();
              fallback.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background-color: #3b82f6;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${Math.floor(size / 2.5)}px;
                font-weight: 600;
                border: 2px solid #e5e7eb;
              `;
              fallback.textContent = initials;
              target.parentElement.appendChild(fallback);
            }
          }}
        />
      );
    }

    // Fallback to initials
    const initials = user.email.split('@')[0].substring(0, 2).toUpperCase();
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.floor(size / 2.5),
          fontWeight: '600',
          border: '2px solid #e5e7eb'
        }}
      >
        {initials}
      </div>
    );
  };

  const columns = [
    {
      key: 'avatar',
      label: 'Avatar',
      width: '80px',
      render: (user: User) => <AvatarDisplay user={user} size={40} />
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user: User) => (
        <div style={{ fontWeight: '500' }}>
          {user.email}
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      width: '120px',
      render: (user: User) => (
        <span style={getRoleBadgeStyle(user.role)}>
          {user.role}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      width: '140px',
      render: (user: User) => (
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      render: (user: User) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={styles.buttonSecondary}
            onClick={() => openViewModal(user)}
          >
            View
          </button>
          {userRole === 'admin' && (
            <>
              <button
                style={styles.buttonSecondary}
                onClick={() => openEditModal(user)}
              >
                Edit
              </button>
              <button
                style={styles.buttonDanger}
                onClick={() => openDeleteModal(user)}
              >
                Delete
              </button>
            </>
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
        <h3 style={{ margin: '0 0 8px 0' }}>Error loading users</h3>
        <p style={{ margin: 0 }}>{error}</p>
        <button
          onClick={fetchUsers}
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
        <h2 style={{ margin: 0, color: '#1f2937' }}>User Management</h2>
        
        {/* User Role Display and Add Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              + Add New User
            </button>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '14px', fontStyle: 'italic' }}>
              Admin access required to manage users
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={pagination.state.search}
            onChange={(e) => pagination.updateSearch(e.target.value)}
            style={{
              width: '80%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <PaginatedTable
        data={users}
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
        emptyMessage="No users found matching your criteria"
      />

      {/* Add User Modal */}
      {showAddModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Add New User</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })
                }
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleCreate}>
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Edit User</h2>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password (leave empty to keep current)</label>
              <input
                style={styles.input}
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password (optional)"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })
                }
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.buttonSecondary}
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button style={styles.button} onClick={handleUpdate}>
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>User Details</h2>
            <div style={styles.formGroup}>
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div style={styles.formGroup}>
              <strong>Role:</strong> 
              <span style={getRoleBadgeStyle(selectedUser.role)}>
                {selectedUser.role}
              </span>
            </div>
            <div style={styles.formGroup}>
              <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
            </div>
            <div style={styles.formGroup}>
              <strong>Updated:</strong> {new Date(selectedUser.updatedAt).toLocaleDateString()}
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
      {showDeleteModal && selectedUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Delete User</h2>
            <p>
              Are you sure you want to delete user "<strong>{selectedUser.email}</strong>"?
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