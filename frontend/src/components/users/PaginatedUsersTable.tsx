import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import PaginatedTable from '../table/PaginatedTable';
import './PaginatedUsersTable.css';
import React from 'react';
import { useDebounce } from '../../hooks/useDebounceHook';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null; // BLOB avatar URL
  avatarMimeType: string | null;
  avatarSizeBytes: number | null;
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
  const { token, user, loading: authLoading } = useAuth();
  const pagination = usePagination(10); // Start with 5 users per page
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(pagination.state.search, 300);
  // Removed unused roleFilter for now
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      const queryParams = new URLSearchParams({
        page: pagination.state.page.toString(),
        limit: pagination.state.limit.toString(),
        sortBy: pagination.state.sortBy,
        sortOrder: pagination.state.sortOrder,
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await fetch(`${API_BASE}/users?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortController.signal
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
    } catch (error: any) {
      if (error.name === 'AbortError') return; 
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Remove fetchUserProfile - role now comes from AuthContext

  useEffect(() => {
    fetchUsers();
  }, [
    pagination.state.page, 
    pagination.state.limit, 
    pagination.state.sortBy, 
    pagination.state.sortOrder,
    debouncedSearch,
    token
  ]);

  // Remove the useEffect that fetches user profile - now from AuthContext
  
  const userRole = user?.role; // Get role from AuthContext user

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
      
      const newUser = await response.json();
      setUsers([newUser, ...users]);
      pagination.updatePagination({ total: pagination.state.total + 1 });
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
      
      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
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
      
      await response;
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      pagination.updatePagination({ total: pagination.state.total - 1 });
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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'paginated-users-role-badge paginated-users-role-admin';
      case 'student':
        return 'paginated-users-role-badge paginated-users-role-student';
      default:
        return 'paginated-users-role-badge paginated-users-role-default';
    }
  };

  const AvatarDisplay = React.memo(
    ({ user, size = 32 }: { user: User; size?: number }) => {
    if (user.avatarUrl) {
      return (
        <img
          src={`${API_BASE}${user.avatarUrl}`}
          alt={`${user.email}'s avatar`}
          className="paginated-users-avatar-img"
          style={{ width: size, height: size }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              const fallback = document.createElement('div');
              const initials = user.email.split('@')[0].substring(0, 2).toUpperCase();
              fallback.className = 'paginated-users-avatar-fallback';
              fallback.style.width = `${size}px`;
              fallback.style.height = `${size}px`;
              fallback.style.fontSize = `${Math.floor(size / 2.5)}px`;
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
        className="paginated-users-avatar-fallback"
        style={{
          width: size,
          height: size,
          fontSize: Math.floor(size / 2.5),
        }}
      >
        {initials}
      </div>
    );}
  );

  // Wait for authentication to complete before rendering table
  if (authLoading) {
    return (
      <div className="paginated-users-container">
        <div className="paginated-users-header">
          <h2 className="paginated-users-title">User Management</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Require authentication for this component
  if (!token || !user) {
    return (
      <div className="paginated-users-container">
        <div className="paginated-users-header">
          <h2 className="paginated-users-title">User Management</h2>
        </div>
        <div className="paginated-users-error">
          <p>Please log in to view users.</p>
        </div>
      </div>
    );
  }

  const columns = useMemo(() => [
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
        <div className="paginated-users-email-cell">
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
        <span className={getRoleBadgeClass(user.role)}>
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
        <div className="paginated-users-date-cell">
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
        <div className="paginated-users-actions">
          <button
            className="paginated-users-button-secondary"
            onClick={() => openViewModal(user)}
          >
            View
          </button>
          {userRole === 'admin' && (
            <>
              <button
                className="paginated-users-button-secondary"
                onClick={() => openEditModal(user)}
              >
                Edit
              </button>
              <button
                className="paginated-users-button-danger"
                onClick={() => openDeleteModal(user)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )
    }
  ], [userRole]);

  if (error) {
    return (
      <div className="paginated-users-error">
        <h3>Error loading users</h3>
        <p>{error}</p>
        <button
          onClick={fetchUsers}
          className="paginated-users-retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="paginated-users-container">
      <div className="paginated-users-header">
        <h2 className="paginated-users-title">User Management</h2>
        
        {/* User Role Display and Add Button */}
        <div className="paginated-users-controls">
          {userRole && (
            <span className="paginated-users-role-display">
              Role: <strong>{userRole}</strong>
            </span>
          )}
          {userRole === 'admin' ? (
            <button
              className="paginated-users-button"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Add New User
            </button>
          ) : (
            <span className="paginated-users-admin-message">
              Admin access required to manage users
            </span>
          )}
        </div>
        
        {/* Search Input */}
        <div className="paginated-users-search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={pagination.state.search}
            onChange={(e) => pagination.updateSearch(e.target.value)}
            className="paginated-users-search-input"
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
        <div className="paginated-users-modal">
          <div className="paginated-users-modal-content">
            <h2>Add New User</h2>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Email</label>
              <input
                className="paginated-users-input"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
              />
            </div>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Password</label>
              <input
                className="paginated-users-input"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
              />
            </div>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Role</label>
              <select
                className="paginated-users-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })
                }
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="paginated-users-modal-buttons">
              <button
                className="paginated-users-button-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-users-button" onClick={handleCreate}>
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="paginated-users-modal">
          <div className="paginated-users-modal-content">
            <h2>Edit User</h2>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Email</label>
              <input
                className="paginated-users-input"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Password (leave empty to keep current)</label>
              <input
                className="paginated-users-input"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password (optional)"
              />
            </div>
            <div className="paginated-users-form-group">
              <label className="paginated-users-label">Role</label>
              <select
                className="paginated-users-select"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as 'student' | 'admin' })
                }
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="paginated-users-modal-buttons">
              <button
                className="paginated-users-button-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-users-button" onClick={handleUpdate}>
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="paginated-users-modal">
          <div className="paginated-users-modal-content">
            <h2>User Details</h2>
            <div className="paginated-users-form-group">
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div className="paginated-users-form-group">
              <strong>Role:</strong> 
              <span className={getRoleBadgeClass(selectedUser.role)}>
                {selectedUser.role}
              </span>
            </div>
            <div className="paginated-users-modal-buttons">
              <button
                className="paginated-users-button"
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
        <div className="paginated-users-modal">
          <div className="paginated-users-modal-content">
            <h2>Delete User</h2>
            <p>
              Are you sure you want to delete user "<strong>{selectedUser.email}</strong>"?
              This action cannot be undone.
            </p>
            <div className="paginated-users-modal-buttons">
              <button
                className="paginated-users-button-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="paginated-users-button-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}