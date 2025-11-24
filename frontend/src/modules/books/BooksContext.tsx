/**
 * Books Context Provider
 * 
 * Centralized state management for books data with caching and performance optimization.
 * This context provides a single source of truth for all book-related data across the application.
 * 
 * Features:
 * - Automatic caching with 5-minute TTL
 * - Shared state across components (no duplicate fetches)
 * - Optimized re-renders with React.memo
 * - AbortController for request cancellation
 * - Error handling and loading states
 * - Support for both paginated and non-paginated requests
 * 
 * @module BooksContext
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
  Book,
  PaginatedResponse,
  PaginationQueryParams,
  CreateBookDto,
  UpdateBookDto,
  BookAvailability,
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
const FEATURED_BOOKS_LIMIT = 8;

// ==========================================
// CONTEXT TYPE DEFINITION
// ==========================================

interface BooksContextType {
  // State
  books: Book[];
  featuredBooks: Book[];
  loading: boolean;
  error: string | null;
  paginationMeta: PaginatedResponse<Book>['meta'] | null;
  
  // Fetch actions
  fetchBooks: (params?: PaginationQueryParams) => Promise<void>;
  fetchFeaturedBooks: (limit?: number) => Promise<void>;
  getBook: (uuid: string) => Promise<Book | null>;
  searchBooks: (query: string, params?: PaginationQueryParams) => Promise<void>;
  
  // CRUD actions (admin only)
  createBook: (data: CreateBookDto) => Promise<Book>;
  updateBook: (uuid: string, data: UpdateBookDto) => Promise<Book>;
  deleteBook: (uuid: string) => Promise<void>;
  uploadCoverImage: (uuid: string, file: File) => Promise<Book>;
  
  // Cache management
  clearCache: () => void;
  refreshBooks: () => Promise<void>;
  invalidateBook: (uuid: string) => void;
  
  // Utility
  checkAvailability: (bookUuid: string) => Promise<BookAvailability | null>;
}

// ==========================================
// CONTEXT CREATION
// ==========================================

const BooksContext = createContext<BooksContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export function BooksProvider({ children }: { children: ReactNode }) {
  // State management
  const [books, setBooks] = useState<Book[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationMeta, setPaginationMeta] = useState<PaginatedResponse<Book>['meta'] | null>(null);
  
  // Cache management
  const booksCache = useRef<CacheEntry<Book[]> | null>(null);
  const featuredCache = useRef<CacheEntry<Book[]> | null>(null);
  const bookCache = useRef<Map<string, CacheEntry<Book>>>(new Map());
  
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
  // FETCH BOOKS (WITH CACHING)
  // ==========================================

  const fetchBooks = useCallback(async (params?: PaginationQueryParams) => {
    // Check cache first (only for non-paginated requests)
    if (!params && isCacheValid(booksCache.current)) {
      console.log('[BooksContext] Using cached books data');
      setBooks(booksCache.current!.data);
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
        ? `${API_BASE}/books?${queryParams}`
        : `${API_BASE}/books`;
      
      console.log('[BooksContext] Fetching books:', url);
      
      const response = await fetch(
        url,
        buildFetchOptions('GET', undefined, abortControllerRef.current.signal)
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      const booksData: Book[] = Array.isArray(data) ? data : data.data;
      const meta = Array.isArray(data) ? null : data.meta;
      
      console.log('[BooksContext] Fetched books:', booksData.length, 'items');
      
      setBooks(booksData);
      setPaginationMeta(meta);
      
      // Cache only full list (no pagination params)
      if (!params) {
        booksCache.current = {
          data: booksData,
          timestamp: Date.now(),
        };
        console.log('[BooksContext] Cached books data');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[BooksContext] Fetch aborted');
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch books';
      console.error('[BooksContext] Error fetching books:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, buildFetchOptions]);

  // ==========================================
  // FETCH FEATURED BOOKS (WITH CACHING)
  // ==========================================

  const fetchFeaturedBooks = useCallback(async (limit = FEATURED_BOOKS_LIMIT) => {
    // Check cache first
    if (isCacheValid(featuredCache.current)) {
      console.log('[BooksContext] Using cached featured books');
      setFeaturedBooks(featuredCache.current!.data);
      return;
    }

    try {
      const url = `${API_BASE}/books?limit=${limit}&sortBy=createdAt&sortOrder=desc`;
      console.log('[BooksContext] Fetching featured books:', url);
      
      const response = await fetch(url, buildFetchOptions('GET'));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const booksData: Book[] = Array.isArray(data) ? data : data.data;
      
      const featured = booksData.slice(0, limit);
      console.log('[BooksContext] Fetched featured books:', featured.length, 'items');
      
      setFeaturedBooks(featured);
      
      // Cache featured books
      featuredCache.current = {
        data: featured,
        timestamp: Date.now(),
      };
      console.log('[BooksContext] Cached featured books');
    } catch (err) {
      console.error('[BooksContext] Error fetching featured books:', err);
      // Don't set error state for featured books (non-critical)
    }
  }, [isCacheValid, buildFetchOptions]);

  // ==========================================
  // GET SINGLE BOOK (WITH CACHING)
  // ==========================================

  const getBook = useCallback(async (uuid: string): Promise<Book | null> => {
    // Check cache first
    const cached = bookCache.current.get(uuid);
    if (cached && isCacheValid(cached)) {
      console.log('[BooksContext] Using cached book:', uuid);
      return cached.data;
    }

    // Try to find in current books/featuredBooks
    const existing = books.find(b => b.id === uuid) || featuredBooks.find(b => b.id === uuid);
    if (existing) {
      console.log('[BooksContext] Found book in memory:', uuid);
      return existing;
    }

    // Fetch from API
    try {
      console.log('[BooksContext] Fetching book:', uuid);
      const response = await fetch(`${API_BASE}/books/${uuid}`, buildFetchOptions('GET'));
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      
      const book: Book = await response.json();
      console.log('[BooksContext] Fetched book:', book.title);
      
      // Cache the book
      bookCache.current.set(uuid, {
        data: book,
        timestamp: Date.now(),
      });
      
      return book;
    } catch (err) {
      console.error('[BooksContext] Error fetching book:', err);
      return null;
    }
  }, [books, featuredBooks, isCacheValid, buildFetchOptions]);

  // ==========================================
  // SEARCH BOOKS
  // ==========================================

  const searchBooks = useCallback(async (query: string, params?: PaginationQueryParams) => {
    await fetchBooks({
      ...params,
      search: query,
    });
  }, [fetchBooks]);

  // ==========================================
  // CREATE BOOK (ADMIN)
  // ==========================================

  const createBook = useCallback(async (data: CreateBookDto): Promise<Book> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('isbn', data.isbn);
      if (data.publishedYear) {
        formData.append('publishedYear', data.publishedYear.toString());
      }
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      
      console.log('[BooksContext] Creating book:', data.title);
      
      const response = await fetch(
        `${API_BASE}/books`,
        buildFetchOptions('POST', formData)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const book: Book = await response.json();
      console.log('[BooksContext] Created book:', book.id);
      
      // Invalidate cache
      clearCache();
      
      // Refresh books list
      await fetchBooks();
      
      return book;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create book';
      console.error('[BooksContext] Error creating book:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchBooks]);

  // ==========================================
  // UPDATE BOOK (ADMIN)
  // ==========================================

  const updateBook = useCallback(async (uuid: string, data: UpdateBookDto): Promise<Book> => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.author) formData.append('author', data.author);
      if (data.isbn) formData.append('isbn', data.isbn);
      if (data.publishedYear) {
        formData.append('publishedYear', data.publishedYear.toString());
      }
      if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
      }
      
      console.log('[BooksContext] Updating book:', uuid);
      
      const response = await fetch(
        `${API_BASE}/books/${uuid}`,
        buildFetchOptions('PATCH', formData)
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const book: Book = await response.json();
      console.log('[BooksContext] Updated book:', book.id);
      
      // Invalidate specific book cache
      invalidateBook(uuid);
      
      // Refresh books list
      await fetchBooks();
      
      return book;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update book';
      console.error('[BooksContext] Error updating book:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchBooks]);

  // ==========================================
  // DELETE BOOK (ADMIN)
  // ==========================================

  const deleteBook = useCallback(async (uuid: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[BooksContext] Deleting book:', uuid);
      
      const response = await fetch(
        `${API_BASE}/books/${uuid}`,
        buildFetchOptions('DELETE')
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      console.log('[BooksContext] Deleted book:', uuid);
      
      // Invalidate cache
      invalidateBook(uuid);
      clearCache();
      
      // Refresh books list
      await fetchBooks();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete book';
      console.error('[BooksContext] Error deleting book:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildFetchOptions, fetchBooks]);

  // ==========================================
  // UPLOAD COVER IMAGE (ADMIN)
  // ==========================================

  const uploadCoverImage = useCallback(async (uuid: string, file: File): Promise<Book> => {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    return updateBook(uuid, { coverImage: file });
  }, [updateBook]);

  // ==========================================
  // CHECK BOOK AVAILABILITY
  // ==========================================

  const checkAvailability = useCallback(async (bookUuid: string): Promise<BookAvailability | null> => {
    try {
      console.log('[BooksContext] Checking availability for book:', bookUuid);
      
      const response = await fetch(
        `${API_BASE}/borrowings/books/${bookUuid}/availability`,
        buildFetchOptions('GET')
      );
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}`);
      }
      
      const availability: BookAvailability = await response.json();
      console.log('[BooksContext] Book availability:', availability);
      
      return availability;
    } catch (err) {
      console.error('[BooksContext] Error checking availability:', err);
      return null;
    }
  }, [buildFetchOptions]);

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  const clearCache = useCallback(() => {
    console.log('[BooksContext] Clearing all caches');
    booksCache.current = null;
    featuredCache.current = null;
    bookCache.current.clear();
  }, []);

  const refreshBooks = useCallback(async () => {
    console.log('[BooksContext] Refreshing books (clearing cache)');
    clearCache();
    await Promise.all([
      fetchBooks(),
      fetchFeaturedBooks(),
    ]);
  }, [clearCache, fetchBooks, fetchFeaturedBooks]);

  const invalidateBook = useCallback((uuid: string) => {
    console.log('[BooksContext] Invalidating book cache:', uuid);
    bookCache.current.delete(uuid);
  }, []);

  // ==========================================
  // AUTO-FETCH ON MOUNT
  // ==========================================

  useEffect(() => {
    console.log('[BooksContext] Initializing - fetching initial data');
    fetchBooks();
    fetchFeaturedBooks();
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Only on mount

  // ==========================================
  // MEMOIZED CONTEXT VALUE
  // ==========================================

  const contextValue = useMemo<BooksContextType>(() => ({
    // State
    books,
    featuredBooks,
    loading,
    error,
    paginationMeta,
    
    // Fetch actions
    fetchBooks,
    fetchFeaturedBooks,
    getBook,
    searchBooks,
    
    // CRUD actions
    createBook,
    updateBook,
    deleteBook,
    uploadCoverImage,
    
    // Cache management
    clearCache,
    refreshBooks,
    invalidateBook,
    
    // Utility
    checkAvailability,
  }), [
    books,
    featuredBooks,
    loading,
    error,
    paginationMeta,
    fetchBooks,
    fetchFeaturedBooks,
    getBook,
    searchBooks,
    createBook,
    updateBook,
    deleteBook,
    uploadCoverImage,
    clearCache,
    refreshBooks,
    invalidateBook,
    checkAvailability,
  ]);

  return (
    <BooksContext.Provider value={contextValue}>
      {children}
    </BooksContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

/**
 * Hook to access books context
 * @throws Error if used outside BooksProvider
 */
export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) {
    throw new Error('useBooks must be used within BooksProvider');
  }
  return context;
}

// ==========================================
// EXPORTS
// ==========================================

export default BooksContext;
