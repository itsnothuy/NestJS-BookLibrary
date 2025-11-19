export interface Borrowing {
  id: number;
  uuid: string;
  userId: number;
  bookId: number;
  requestId: number | null;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: 'active' | 'returned' | 'overdue';
  daysOverdue: number;
  lateFeeAmount: number;
  lateFeePerDay: number;
  borrowNotes: string | null;
  returnNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BorrowingRow = Borrowing;

// Extended type with user and book details for API responses
export interface BorrowingWithDetails extends Borrowing {
  user?: {
    id: number;
    uuid: string;
    email: string;
    role: string;
  };
  book?: {
    id: number;
    uuid: string;
    title: string;
    author: string;
    isbn: string;
    publishedYear: number | null;
    coverImageFilename?: string;
  };
}

// Book inventory tracking
export interface BookInventory {
  bookId: number;
  totalCopies: number;
  availableCopies: number;
  createdAt: Date;
  updatedAt: Date;
}

export type BookInventoryRow = BookInventory;
