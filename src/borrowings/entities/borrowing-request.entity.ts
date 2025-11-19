export interface BorrowingRequest {
  id: number;
  uuid: string;
  userId: number;
  bookId: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
  requestedDays: number;
  processedBy: number | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BorrowingRequestRow = BorrowingRequest;

// Extended type with user and book details for API responses
export interface BorrowingRequestWithDetails extends BorrowingRequest {
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
    coverImageFilename?: string;
  };
  processor?: {
    id: number;
    uuid: string;
    email: string;
  };
}
