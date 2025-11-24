/**
 * Books Context
 * 
 * Centralized state management for books data.
 * Provides books data and operations to all components via React Context.
 * 
 * Phase 1, Step 1.3: Added fetchBooks() and fetchFeaturedBooks() with caching
 * 
 * @fileoverview Books context provider
 * @author Student Library System
 * @date November 24, 2025
 */

import { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Book } from '../../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// ============================================================================
// TYPES
// ============================================================================

/**
 * Books context state
 * 
 * Contains all books-related state and operations.
 */
interface BooksContextState {
  // Data
  books: Book[];
  loading: boolean;
  error: string | null;
  
  // Operations (to be implemented in later steps)
  fetchBooks: () => Promise<void>;
  fetchFeaturedBooks: () => Promise<void>;
  createBook: (bookData: Partial<Book>) => Promise<void>;
  updateBook: (id: string, bookData: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Books context
 * 
 * Provides books state and operations to child components.
 * Must be accessed via useBooks() hook.
 */
const BooksContext = createContext<BooksContextState | undefined>(undefined);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface BooksProviderProps {
  children: ReactNode;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Books Provider
 * 
 * Wraps the application (or part of it) to provide books context.
 * 
 * @param {BooksProviderProps} props - Provider props
 * @param {ReactNode} props.children - Child components
 * 
 * @example
 * ```tsx
 * <BooksProvider>
 *   <App />
 * </BooksProvider>
 * ```
 */
export function BooksProvider({ children }: BooksProviderProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ============================================================================
  // REFS FOR CACHING AND ABORT CONTROL
  // ============================================================================
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const cacheRef = useRef<Book[]>([]);
  
  // ============================================================================
  // FETCH OPERATIONS
  // ============================================================================
  
  /**
   * Fetch all books from the API
   * 
   * Fetches all books from the backend with caching.
   * Uses AbortController to cancel previous requests.
   * Caches results for 5 minutes to reduce API calls.
   * 
   * @returns {Promise<void>}
   */
  const fetchBooks = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    const cacheAge = now - lastFetchTimeRef.current;
    
    if (cacheAge < CACHE_DURATION && cacheRef.current.length > 0) {
      console.log('Using cached books data');
      setBooks(cacheRef.current);
      return;
    }
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/books`, {
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Book[] = await response.json();
      
      // Update state and cache
      setBooks(data);
      cacheRef.current = data;
      lastFetchTimeRef.current = Date.now();
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Fetch featured books from the API
   * 
   * Fetches 8 featured books sorted by availability.
   * Uses AbortController to cancel previous requests.
   * Does NOT use cache (always fresh data).
   * 
   * @returns {Promise<void>}
   */
  const fetchFeaturedBooks = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE}/books?limit=8&sortBy=availableCopies&sortOrder=desc`,
        { signal: abortController.signal }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const data: Book[] = result.data || [];
      
      // Update state (no cache for featured books)
      setBooks(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignore abort errors
        return;
      }
      console.error('Error fetching featured books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured books');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // ============================================================================
  // CRUD OPERATIONS (Placeholder - to be implemented in Phase 2)
  // ============================================================================
  
  const createBook = useCallback(async () => {
    console.log('createBook not yet implemented - will be added in Phase 2');
  }, []);
  
  const updateBook = useCallback(async () => {
    console.log('updateBook not yet implemented - will be added in Phase 2');
  }, []);
  
  const deleteBook = useCallback(async () => {
    console.log('deleteBook not yet implemented - will be added in Phase 2');
  }, []);
  
  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: BooksContextState = {
    // Data
    books,
    loading,
    error,
    
    // Operations
    fetchBooks,
    fetchFeaturedBooks,
    createBook,
    updateBook,
    deleteBook,
    clearError,
  };

  return (
    <BooksContext.Provider value={value}>
      {children}
    </BooksContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Use Books Hook
 * 
 * Custom hook to access books context.
 * Must be used within a BooksProvider.
 * 
 * @returns {BooksContextState} Books context state and operations
 * @throws {Error} If used outside of BooksProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { books, loading, error, fetchBooks } = useBooks();
 *   
 *   useEffect(() => {
 *     fetchBooks();
 *   }, []);
 *   
 *   return <div>{books.map(book => ...)}</div>;
 * }
 * ```
 */
export function useBooks(): BooksContextState {
  const context = useContext(BooksContext);
  
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  
  return context;
}
