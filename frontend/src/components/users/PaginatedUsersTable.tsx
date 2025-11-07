import { useState, useEffect } from 'react';
import { useAuth } from '../../modules/auth/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import PaginatedTable from '../table/PaginatedTable';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  avatarFilename: string | null;
  avatarMimeType: string | null;
  avatarSizeBytes: number | null;
  avatarWidth: number | null;
  avatarHeight: number | null;
  avatarUploadedAt: string | null;
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

  useEffect(() => {
    fetchUsers();
  }, [
    pagination.state.page, 
    pagination.state.limit, 
    pagination.state.sortBy, 
    pagination.state.sortOrder,
    pagination.state.search,
    roleFilter,
    token
  ]);

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
          src={user.avatarUrl}
          alt={`${user.email}'s avatar`}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e5e7eb'
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
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => console.log('View user:', user.id)}
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
            onClick={() => console.log('Edit user:', user.id)}
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
            onClick={() => console.log('Delete user:', user.id)}
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
        
        {/* Search Input */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search users..."
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

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '120px'
          }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>

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
    </div>
  );
}