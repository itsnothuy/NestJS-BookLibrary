/**
 * Shared Type Definitions
 * 
 * This file contains all shared types used across the frontend application.
 * Types are extracted from backend DTOs and component interfaces to ensure consistency.
 * 
 * @fileoverview Centralized type definitions
 * @author Student Library System
 * @date November 24, 2025
 */

// ============================================================================
// BOOK TYPES
// ============================================================================

/**
 * Book entity as returned by the backend API
 * 
 * Represents a book in the library system.
 * 
 * @property {string} id - UUID identifier (e.g., "123e4567-e89b-12d3-a456-426614174000")
 * @property {string} title - Book title
 * @property {string} author - Book author name
 * @property {string} isbn - International Standard Book Number
 * @property {number | null} publishedYear - Year of publication (null if unknown)
 * @property {string} [coverImageUrl] - Optional URL to book cover image
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form data for creating or updating a book
 * 
 * Used in admin forms for book CRUD operations.
 * 
 * @property {string} title - Book title (required)
 * @property {string} author - Book author name (required)
 * @property {string} isbn - International Standard Book Number (required)
 * @property {number} publishedYear - Year of publication (required in form)
 */
export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User entity as returned by the backend API
 * 
 * Represents a user (student or admin) in the system.
 * 
 * @property {string} id - UUID identifier
 * @property {string} email - User email address (unique)
 * @property {'admin' | 'student'} role - User role in the system
 * @property {string} createdAt - ISO 8601 timestamp of account creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {string | null} avatarUrl - BLOB URL to avatar image (null if no avatar)
 * @property {string | null} avatarMimeType - MIME type of avatar (e.g., "image/jpeg")
 * @property {number | null} avatarSizeBytes - Avatar file size in bytes
 * @property {string | null} avatarUploadedAt - ISO 8601 timestamp of avatar upload
 */
export interface User {
  id: string;
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
 * Form data for creating or updating a user
 * 
 * Used in admin forms for user CRUD operations.
 * 
 * @property {string} email - User email address (required)
 * @property {string} password - User password (required for creation)
 * @property {'student' | 'admin'} role - User role (required)
 */
export interface UserFormData {
  email: string;
  password: string;
  role: 'student' | 'admin';
}

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination metadata returned by the backend
 * 
 * Contains information about the current page and navigation.
 * 
 * @property {number} total - Total number of items in the dataset
 * @property {number} page - Current page number (1-indexed)
 * @property {number} limit - Number of items per page
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNextPage - Whether there is a next page
 * @property {boolean} hasPreviousPage - Whether there is a previous page
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
 * 
 * Contains URLs for navigating between pages.
 * 
 * @property {string} first - URL to first page
 * @property {string} [previous] - URL to previous page (undefined if on first page)
 * @property {string} [next] - URL to next page (undefined if on last page)
 * @property {string} last - URL to last page
 */
export interface PaginationLinks {
  first: string;
  previous?: string;
  next?: string;
  last: string;
}

/**
 * Generic paginated response from the backend
 * 
 * Standard response format for paginated endpoints.
 * 
 * @template T - Type of data items (e.g., Book, User)
 * @property {T[]} data - Array of data items for current page
 * @property {PaginationMeta} meta - Pagination metadata
 * @property {PaginationLinks} links - Navigation links
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

// ============================================================================
// BORROWING TYPES (if needed in the future)
// ============================================================================

/**
 * Borrowing status enum
 * 
 * Possible states for a borrowing request.
 */
export type BorrowingStatus = 'pending' | 'approved' | 'rejected' | 'returned';

/**
 * Borrowing entity (placeholder for future use)
 * 
 * Represents a book borrowing request/record.
 * 
 * @property {string} id - UUID identifier
 * @property {string} bookId - Book UUID being borrowed
 * @property {string} userId - User UUID making the request
 * @property {BorrowingStatus} status - Current status of the borrowing
 * @property {number} requestedDays - Number of days requested for borrowing
 * @property {string} [borrowedAt] - ISO 8601 timestamp when approved
 * @property {string} [dueDate] - ISO 8601 timestamp when book is due
 * @property {string} [returnedAt] - ISO 8601 timestamp when book was returned
 * @property {string} createdAt - ISO 8601 timestamp of request creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 */
export interface Borrowing {
  id: string;
  bookId: string;
  userId: string;
  status: BorrowingStatus;
  requestedDays: number;
  borrowedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

/**
 * Standard API error response
 * 
 * Format returned by backend when an error occurs.
 * 
 * @property {string} message - Human-readable error message
 * @property {number} statusCode - HTTP status code
 * @property {string} [error] - Error type/name
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Generic API response wrapper
 * 
 * @template T - Type of the response data
 * @property {T} [data] - Response data (if successful)
 * @property {ApiError} [error] - Error information (if failed)
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * Loading state for async operations
 * 
 * @property {boolean} loading - Whether operation is in progress
 * @property {string | null} error - Error message if operation failed
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}
