/**
 * Users Context Provider
 * 
 * Centralized state management for users data (Admin features).
 * This context provides user management capabilities for admin users.
 * 
 * Features:
 * - Automatic caching with 5-minute TTL
 * - Shared state across admin components
 * - Avatar upload support
 * - CRUD operations for user management
 * - Error handling and loading states
 * - Pagination support
 * 
 * @module UsersContext
 * @see DATA_FETCHING_ANALYSIS.md for implementation details
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';
import type {
  User,
  PaginatedResponse,
  PaginationQueryParams,
  CreateUserDto,
  UpdateUserDto,
} from '../../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// ==========================================
// CACHE CONFIGURATION
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ==========================================
// CONTEXT TYPE DEFINITION
// ==========================================

interface UsersContextType {
  // State
  users: User[];
  loading: boolean;
  error: string | null;
  paginationMeta: PaginatedResponse<User>['meta'] | null;
  
  // Fetch actions
  fetchUsers: (params?: PaginationQueryParams) => Promise<void>;
  getUser: (uuid: string) => Promise<User | null>;
  searchUsers: (query: string, params?: PaginationQueryParams) => Promise<void>;
  
  // CRUD actions (admin only)
  createUser: (data: CreateUserDto) => Promise<User>;
  updateUser: (uuid: string, data: UpdateUserDto) => Promise<User>;
  deleteUser: (uuid: string) => Promise<void>;
  
  // Avatar management
  uploadAvatar: (uuid: string, file: File) => Promise<User>;
  deleteAvatar: (uuid: string) => Promise<User>;
  
  // Cache management
  clearCache: () => void;
  refreshUsers: () => Promise<void>;
  invalidateUser: (uuid: string) => void;
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export function UsersProvider({ children }: { children: ReactNode }) {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginatedResponse<User>['meta'] | null>(null);
  
  // Cache management
  const usersCache = useRef<CacheEntry<User[]> | null>(null);
  const userCache = useRef<Map<string, CacheEntry<User>>>(new Map());
  
  // Abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback(<T,>(cache: CacheEntry<T> | null): boolean => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  /**
   * Get auth token from localStorage
   */
  const getAuthToken = useCallback((): string | null => {
    return localStorage.getItem('token');
  }, []);

  /**
   * Build fetch options with auth header
   */
  const buildFetchOptions = useCallback((
    method: string = 'GET',
    body?: any,
    signal?: AbortSignal
  ): RequestInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    return {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal,
    };
  }, [getAuthToken]);

  // ==========================================
  // FETCH USERS (WITH CACHING)
  // ==========================================

  const fetchUsers = useCallback(async (params?: PaginationQueryParams) => {
    // Check cache first (only for non-paginated requests)
    if (!params && isCacheValid(usersCache.current)) {
      console.log('[UsersContext] Using cached users data');
      setUsers(usersCache.current!.data);
      return;
    }

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const url = queryParams.toString() 
        ? `${API_BASE}/users?${queryParams}`
        : `${API_BASE}/users`;
      
      console.log('[UsersContext] Fetching users:', url);
      
      const response = await fetch(
        url,
        buildFetchOptions('GET', undefined, abortControllerRef.current.signal)
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      const usersData: User[] = Array.isArray(data) ? data : data.data;
      const meta = Array.isArray(data) ? null : data.meta;
      
      console.log('[UsersContext] Fetched users:', usersData.length, 'items');
      
      setUsers(usersData);
      setPaginationMeta(meta);
      
      // Cache only full list (no pagination params)
      if (!params) {
        usersCache.current = {
          data: usersData,
          timestamp: Date.now(),
        };
        console.log('[UsersContext] Cached users data');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[UsersContext] Fetch aborted');
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('[UsersContext] Error fetching users:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, buildFetchOptions]);

  // ==========================================
  // GET SINGLE USER (WITH CACHING)
  // ==========================================

  const getUser = useCallback(async (uuid: string): Promise<User | null> => {
    // Check cache first
    const cached = userCache.current.get(uuid);
    if (cached && isCacheValid(cached)) {
      console.log('[UsersContext] Using cached user:', uuid);
      return cached.data;
    }

    // Try to find in current users
    const existing = users.find(u => u.id === uuid);
    if (existing) {
      console.log('[UsersContext] Found user in memory:', uuid);
      return existing;
    }

    // Fetch from API
    try {
      console.log('[UsersContext] Fetching user:', uuid);
      const response = await fetch(`${API_BASE}/users/${uuid}`, buildFetchOptions('GET'));
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      
      const user: User = await response.json();
      console.log('[UsersContext] Fetched user:', user.email);
      
      // Cache the user
      userCache.current.set(uuid, {
        data: user,
        timestamp: Date.now(),
      });
      
      return user;
    } catch (err) {
      console.error('[UsersContext] Error fetching user:', err);
      return null;
    }
  }, [users, isCacheValid, buildFetchOptions]);

  // ==========================================
  // SEARCH USERS
  // ==========================================

  const searchUsers = useCallback(async (query: string, params?: PaginationQueryParams) => {
    await fetchUsers({
      ...params,
      search: query,
    });
  }, [fetchUsers]);

  // ==========================================
  // CREATE USER (ADMIN)
  // ==========================================

  const createUser = useCallback(async (data: CreateUserDto): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[UsersContext] Creating user:', data.email);
      
      const response = await fetch(
        `${API_BASE}/users`,
        buildFetchOptions('POST', data)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const user: User = await response.json();
      console.log('[UsersContext] Created user:', user.id);
      
      // Invalidate cache
      clearCache();
      
      // Refresh users list
      await fetchUsers();
      
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      console.error('[UsersContext] Error creating user:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchUsers]);

  // ==========================================
  // UPDATE USER (ADMIN)
  // ==========================================

  const updateUser = useCallback(async (uuid: string, data: UpdateUserDto): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[UsersContext] Updating user:', uuid);
      
      const response = await fetch(
        `${API_BASE}/users/${uuid}`,
        buildFetchOptions('PATCH', data)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const user: User = await response.json();
      console.log('[UsersContext] Updated user:', user.id);
      
      // Invalidate specific user cache
      invalidateUser(uuid);
      
      // Refresh users list
      await fetchUsers();
      
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      console.error('[UsersContext] Error updating user:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchUsers]);

  // ==========================================
  // DELETE USER (ADMIN)
  // ==========================================

  const deleteUser = useCallback(async (uuid: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[UsersContext] Deleting user:', uuid);
      
      const response = await fetch(
        `${API_BASE}/users/${uuid}`,
        buildFetchOptions('DELETE')
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      console.log('[UsersContext] Deleted user:', uuid);
      
      // Invalidate cache
      invalidateUser(uuid);
      clearCache();
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      console.error('[UsersContext] Error deleting user:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchUsers]);

  // ==========================================
  // UPLOAD AVATAR
  // ==========================================

  const uploadAvatar = useCallback(async (uuid: string, file: File): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      console.log('[UsersContext] Uploading avatar for user:', uuid);
      
      const response = await fetch(
        `${API_BASE}/users/${uuid}/avatar`,
        buildFetchOptions('POST', formData)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const user: User = await response.json();
      console.log('[UsersContext] Uploaded avatar:', user.id);
      
      // Invalidate specific user cache
      invalidateUser(uuid);
      
      // Update user in current list
      setUsers(prev => prev.map(u => u.id === uuid ? user : u));
      
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      console.error('[UsersContext] Error uploading avatar:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions]);

  // ==========================================
  // DELETE AVATAR
  // ==========================================

  const deleteAvatar = useCallback(async (uuid: string): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[UsersContext] Deleting avatar for user:', uuid);
      
      const response = await fetch(
        `${API_BASE}/users/${uuid}/avatar`,
        buildFetchOptions('DELETE')
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const user: User = await response.json();
      console.log('[UsersContext] Deleted avatar:', user.id);
      
      // Invalidate specific user cache
      invalidateUser(uuid);
      
      // Update user in current list
      setUsers(prev => prev.map(u => u.id === uuid ? user : u));
      
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete avatar';
      console.error('[UsersContext] Error deleting avatar:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions]);

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  const clearCache = useCallback(() => {
    console.log('[UsersContext] Clearing all caches');
    usersCache.current = null;
    userCache.current.clear();
  }, []);

  const refreshUsers = useCallback(async () => {
    console.log('[UsersContext] Refreshing users (clearing cache)');
    clearCache();
    await fetchUsers();
  }, [clearCache, fetchUsers]);

  const invalidateUser = useCallback((uuid: string) => {
    console.log('[UsersContext] Invalidating user cache:', uuid);
    userCache.current.delete(uuid);
  }, []);

  // ==========================================
  // AUTO-FETCH ON MOUNT (OPTIONAL)
  // ==========================================

  useEffect(() => {
    // Note: We don't auto-fetch users on mount because this is admin-only
    // and we want to fetch only when needed
    console.log('[UsersContext] Initialized (no auto-fetch)');
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ==========================================
  // MEMOIZED CONTEXT VALUE
  // ==========================================

  const contextValue = useMemo<UsersContextType>(() => ({
    // State
    users,
    loading,
    error,
    paginationMeta,
    
    // Fetch actions
    fetchUsers,
    getUser,
    searchUsers,
    
    // CRUD actions
    createUser,
    updateUser,
    deleteUser,
    
    // Avatar management
    uploadAvatar,
    deleteAvatar,
    
    // Cache management
    clearCache,
    refreshUsers,
    invalidateUser,
  }), [
    users,
    loading,
    error,
    paginationMeta,
    fetchUsers,
    getUser,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadAvatar,
    deleteAvatar,
    clearCache,
    refreshUsers,
    invalidateUser,
  ]);

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

/**
 * Hook to access users context
 * @throws Error if used outside UsersProvider
 */
export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within UsersProvider');
  }
  return context;
}

// ==========================================
// EXPORTS
// ==========================================

export default UsersContext;
