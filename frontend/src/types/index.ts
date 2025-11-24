/**
 * Shared Type Definitions
 * 
 * This file contains all shared types used across the frontend application.
 * All interfaces match the backend DTOs to ensure type consistency.
 * 
 * Last Updated: November 24, 2025
 */

// ==========================================
// BOOK TYPES
// ==========================================

/**
 * Book interface matching backend BookResponseDto
 * @see src/books/dto/book-response.dto.ts
 */
export interface Book {
  id: string; // UUID from backend
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageUrl?: string; // e.g., "/uploads/book-covers/book-cover-123.jpg"
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended Book interface with inventory/availability information
 * Used when additional metadata is needed (e.g., in admin panels)
 */
export interface BookWithInventory extends Book {
  availableCopies?: number;
  totalCopies?: number;
  borrowedCount?: number;
  genre?: string;
}

/**
 * DTO for creating a new book
 * @see src/books/dto/create-book.dto.ts
 */
export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  publishedYear?: number;
  coverImage?: File; // For file upload
}

/**
 * DTO for updating an existing book
 * All fields are optional for partial updates
 */
export interface UpdateBookDto {
  title?: string;
  author?: string;
  isbn?: string;
  publishedYear?: number;
  coverImage?: File;
}

// ==========================================
// USER TYPES
// ==========================================

/**
 * User interface matching backend UserResponseDto
 * @see src/users/dto/user-response.dto.ts
 */
export interface User {
  id: string; // UUID
  email: string;
  role: 'admin' | 'student';
  createdAt: string;
  updatedAt: string;
  avatarUrl: string | null;
  avatarMimeType: string | null;
  avatarSizeBytes: number | null;
  avatarUploadedAt: string | null;
}

/**
 * DTO for creating a new user
 * @see src/users/dto/create-user.dto.ts
 */
export interface CreateUserDto {
  email: string;
  password: string;
  role: 'admin' | 'student';
}

/**
 * DTO for updating an existing user
 * All fields are optional for partial updates
 */
export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'admin' | 'student';
}

// ==========================================
// BORROWING TYPES
// ==========================================

/**
 * Borrowing interface for active borrows
 * @see src/borrowings/dto/borrowing-response.dto.ts
 */
export interface Borrowing {
  uuid: string;
  bookUuid: string;
  userUuid: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: 'borrowed' | 'returned' | 'overdue';
  returnNotes?: string;
  // Populated fields
  book?: Book;
  user?: User;
}

/**
 * Borrowing request interface for pending requests
 * @see src/borrowings/dto/borrow-request-response.dto.ts
 */
export interface BorrowingRequest {
  uuid: string;
  bookUuid: string;
  userUuid: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  borrowDurationDays: number;
  notes?: string;
  // Populated fields
  book?: Book;
  user?: User;
}

/**
 * Book availability information
 */
export interface BookAvailability {
  bookUuid: string;
  available: boolean;
  availableCopies: number;
  totalCopies: number;
  borrowedCount: number;
  overdueCount: number;
  message: string;
}

// ==========================================
// PAGINATION TYPES
// ==========================================

/**
 * Pagination metadata returned by backend
 * @see src/common/dto/pagination-response.dto.ts
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Pagination links for navigation
 */
export interface PaginationLinks {
  first: string;
  previous?: string;
  next?: string;
  last: string;
}

/**
 * Generic paginated response wrapper
 * Used for all paginated endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

/**
 * Query parameters for pagination requests
 */
export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ==========================================
// AUTHENTICATION TYPES
// ==========================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Auth response with JWT token
 * @see src/auth/dto/auth-response.dto.ts
 */
export interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Authenticated user context
 */
export interface AuthUser extends User {
  token: string;
}

// ==========================================
// API ERROR TYPES
// ==========================================

/**
 * Standard API error response
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  constraints: Record<string, string>;
}

// ==========================================
// UTILITY TYPES
// ==========================================

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ==========================================
// FILTER TYPES
// ==========================================

/**
 * Filter options for books
 */
export interface BookFilters extends PaginationQueryParams {
  author?: string;
  publishedYear?: number;
  isbn?: string;
}

/**
 * Filter options for users
 */
export interface UserFilters extends PaginationQueryParams {
  role?: 'admin' | 'student';
}

/**
 * Filter options for borrowings
 */
export interface BorrowingFilters extends PaginationQueryParams {
  status?: 'borrowed' | 'returned' | 'overdue';
  userUuid?: string;
  bookUuid?: string;
}

// ==========================================
// STATISTICS TYPES
// ==========================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrowings: number;
  pendingRequests: number;
  overdueBooks: number;
}

/**
 * Book statistics
 */
export interface BookStats {
  bookUuid: string;
  totalBorrows: number;
  currentlyBorrowed: number;
  averageBorrowDuration: number;
  popularityRank: number;
}

/**
 * User statistics
 */
export interface UserStats {
  userUuid: string;
  totalBorrows: number;
  currentBorrows: number;
  overdueCount: number;
  averageReturnTime: number;
}
