/**
 * Books Context
 * 
 * Centralized state management for books data.
 * Provides books data and operations to all components via React Context.
 * 
 * Phase 1, Step 1.2: Structure only (no fetching logic yet)
 * 
 * @fileoverview Books context provider
 * @author Student Library System
 * @date November 24, 2025
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Book } from '../../types';

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
  // State will be implemented in Step 1.3
  // For now, just provide empty/placeholder values
  
  const value: BooksContextState = {
    // Data (empty for now)
    books: [],
    loading: false,
    error: null,
    
    // Operations (placeholder functions for now)
    fetchBooks: async () => {
      console.log('fetchBooks not yet implemented');
    },
    fetchFeaturedBooks: async () => {
      console.log('fetchFeaturedBooks not yet implemented');
    },
    createBook: async () => {
      console.log('createBook not yet implemented');
    },
    updateBook: async () => {
      console.log('updateBook not yet implemented');
    },
    deleteBook: async () => {
      console.log('deleteBook not yet implemented');
    },
    clearError: () => {
      console.log('clearError not yet implemented');
    },
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
