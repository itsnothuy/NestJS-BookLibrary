import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

// ============= TYPES =============

interface Borrowing {
  uuid: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: 'active' | 'overdue' | 'returned';
  daysOverdue: number;
  lateFeeAmount: number;
  borrowNotes: string | null;
  returnNotes: string | null;
  book?: {
    uuid: string;
    title: string;
    author: string;
    isbn: string;
    coverImageFilename?: string;
  };
}

interface BorrowingRequest {
  uuid: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
  requestedDays: number;
  processedAt: string | null;
  rejectionReason: string | null;
  book?: {
    uuid: string;
    title: string;
    author: string;
    isbn: string;
    coverImageFilename?: string;
  };
}

interface BorrowingContextType {
  borrowings: Borrowing[];
  requests: BorrowingRequest[];
  history: Borrowing[];
  loading: boolean;
  error: string | null;
  requestBorrow: (bookUuid: string, days?: number) => Promise<void>;
  cancelRequest: (requestUuid: string) => Promise<void>;
  returnBook: (borrowingUuid: string, returnNotes?: string) => Promise<void>;
  refreshBorrowings: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  checkBookAvailability: (bookUuid: string) => Promise<BookAvailability>;
}

interface BookAvailability {
  bookUuid: string;
  bookTitle: string;
  isAvailable: boolean;
  totalCopies: number;
  availableCopies: number;
  activeBorrowings: number;
  totalBorrowings: number;
  averageBorrowDays: number;
}

// ============= CONTEXT =============

const BorrowingContext = createContext<BorrowingContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function BorrowingProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [requests, setRequests] = useState<BorrowingRequest[]>([]);
  const [history, setHistory] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============= FETCH FUNCTIONS =============

  const refreshBorrowings = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/borrowings/my-borrowings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load borrowings');
      }

      const data = await res.json();
      setBorrowings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load borrowings');
      console.error('Error fetching borrowings:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshRequests = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/borrowings/my-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }, [token]);

  const refreshHistory = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE}/borrowings/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load history');
      }

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-refresh on mount if authenticated - moved below function definitions
  useEffect(() => {
    if (isAuthenticated && token) {
      refreshBorrowings();
      refreshRequests();
    }
  }, [isAuthenticated, token, refreshBorrowings, refreshRequests]);

  // ============= ACTION FUNCTIONS =============

  const requestBorrow = async (bookUuid: string, days = 14) => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookUuid, requestedDays: days }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to request borrow');
    }

    // Refresh requests to show the new one
    await refreshRequests();
  };

  const cancelRequest = async (requestUuid: string) => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/cancel/${requestUuid}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to cancel request');
    }
    
    // Refresh requests to remove the cancelled one
    await refreshRequests();
  };

  const returnBook = async (borrowingUuid: string, returnNotes?: string) => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/return/${borrowingUuid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ returnNotes: returnNotes || undefined }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to return book');
    }

    // Refresh both borrowings and history
    await Promise.all([refreshBorrowings(), refreshHistory()]);
  };

  const checkBookAvailability = async (bookUuid: string): Promise<BookAvailability> => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/availability/${bookUuid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error('Failed to check availability');
    }

    return res.json();
  };

  // ============= CONTEXT VALUE =============

  const value: BorrowingContextType = useMemo(() => ({
    borrowings,
    requests,
    history,
    loading,
    error,
    requestBorrow,
    cancelRequest,
    returnBook,
    refreshBorrowings,
    refreshRequests,
    refreshHistory,
    checkBookAvailability,
  }), [
    borrowings,
    requests,
    history,
    loading,
    error,
    refreshBorrowings,
    refreshRequests,
    refreshHistory,
  ]);

  return (
    <BorrowingContext.Provider value={value}>
      {children}
    </BorrowingContext.Provider>
  );
}

// ============= HOOK =============

export const useBorrowing = () => {
  const context = useContext(BorrowingContext);
  if (!context) {
    throw new Error('useBorrowing must be used within BorrowingProvider');
  }
  return context;
};

// ============= TYPES EXPORT =============

export type { Borrowing, BorrowingRequest, BookAvailability };
