export interface User {
  id: number; // Internal auto-increment ID (not exposed to client)
  uuid: string; // Public-facing UUID
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - Filesystem storage
  avatarFilename?: string; // Original filename (e.g., "profile.jpg")
  avatarPath?: string; // Server file path (e.g., "uploads/avatars/avatar-123456789.jpg")
  avatarUrl?: string; // Public serving URL (e.g., "/users/avatar/avatar-123456789.jpg")
  avatarMimeType?: string; // MIME type for Content-Type header
  avatarSizeBytes?: number; // File size for validation and display
  avatarUploadedAt?: Date; // Upload timestamp for cache control
}

export type UserRow = User;