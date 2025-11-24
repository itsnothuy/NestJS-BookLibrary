/**
 * Books Context Test Component
 * 
 * This is a temporary test component to verify BooksContext works correctly.
 * 
 * Phase 1, Step 1.5: Test BooksContext in isolation
 * 
 * TO BE DELETED after verification is complete.
 * 
 * @fileoverview Test component for BooksContext
 * @author Student Library System
 * @date November 24, 2025
 */

import { useEffect } from 'react';
import { useBooks } from '../../modules/books/BooksContext';

/**
 * Books Context Test Component
 * 
 * Tests the BooksContext by:
 * 1. Fetching all books
 * 2. Logging data to console
 * 3. Displaying loading/error states
 * 4. Testing cache by fetching twice
 * 
 * This component should be temporarily added to a route for testing.
 */
export default function BooksContextTest() {
  const { books, loading, error, fetchBooks } = useBooks();

  useEffect(() => {
    console.log('=== BooksContext Test: Initial Fetch ===');
    fetchBooks();
    
    // Test cache after 2 seconds
    const cacheTest = setTimeout(() => {
      console.log('=== BooksContext Test: Cache Test (should use cached data) ===');
      fetchBooks();
    }, 2000);
    
    return () => clearTimeout(cacheTest);
  }, [fetchBooks]);

  useEffect(() => {
    if (books.length > 0) {
      console.log('=== BooksContext Test: Books Loaded ===');
      console.log(`Total books: ${books.length}`);
      console.log('First book:', books[0]);
      console.log('All books:', books);
    }
  }, [books]);

  useEffect(() => {
    if (error) {
      console.error('=== BooksContext Test: Error ===');
      console.error(error);
    }
  }, [error]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>📚 BooksContext Test</h1>
      
      <div style={{ 
        padding: '15px', 
        background: '#f3f4f6', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Status:</h2>
        <p><strong>Loading:</strong> {loading ? '🔄 Yes' : '✅ No'}</p>
        <p><strong>Error:</strong> {error || '✅ None'}</p>
        <p><strong>Books Count:</strong> {books.length}</p>
      </div>

      {loading && (
        <div style={{ 
          padding: '20px', 
          background: '#dbeafe', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p>⏳ Loading books...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '20px', 
          background: '#fee2e2', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p>❌ Error: {error}</p>
        </div>
      )}

      {books.length > 0 && (
        <div>
          <h2>Books Data:</h2>
          <div style={{ 
            padding: '15px', 
            background: '#d1fae5', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p>✅ Successfully loaded {books.length} books!</p>
          </div>
          
          <h3>First 3 Books:</h3>
          {books.slice(0, 3).map((book, index) => (
            <div 
              key={book.id} 
              style={{ 
                padding: '10px', 
                background: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                marginBottom: '10px'
              }}
            >
              <p><strong>#{index + 1}</strong></p>
              <p><strong>ID:</strong> {book.id}</p>
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Year:</strong> {book.publishedYear || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        background: '#fef3c7',
        borderRadius: '8px'
      }}>
        <h3>📝 Instructions:</h3>
        <ol style={{ marginLeft: '20px' }}>
          <li>Check browser console for detailed logs</li>
          <li>Verify "Using cached books data" message on second fetch</li>
          <li>Check Network tab in DevTools - should see only 1 API call</li>
          <li>If all works, this component can be deleted</li>
        </ol>
      </div>

      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        background: '#f3f4f6',
        borderRadius: '8px'
      }}>
        <h3>✅ Checklist:</h3>
        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
          <li>{books.length > 0 ? '✅' : '⬜'} Books data loaded</li>
          <li>{!loading ? '✅' : '⬜'} Not in loading state</li>
          <li>{!error ? '✅' : '⬜'} No errors</li>
          <li>⬜ Check console: Cache message appears</li>
          <li>⬜ Check Network: Only 1 API call</li>
          <li>⬜ All book objects have correct types</li>
        </ul>
      </div>
    </div>
  );
}
