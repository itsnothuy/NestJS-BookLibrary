export interface User {
  id: number; // Internal auto-increment ID (not exposed to client)
  uuid: string; // Public-facing UUID
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - Simplified filesystem storage (only filename)
  avatarFilename?: string; // Just the filename (e.g., "avatar-123456789.jpg")
  avatarMimeType?: string; // MIME type for Content-Type header
  avatarSizeBytes?: number; // File size for validation and display
  avatarUploadedAt?: Date; // Upload timestamp for cache control
}

export type UserRow = User;