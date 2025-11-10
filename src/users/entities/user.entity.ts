export interface User {
  id: number; // Internal auto-increment ID (not exposed to client)
  uuid: string; // Public-facing UUID
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - BLOB storage
  avatarData?: Buffer; // Avatar image data stored as BLOB
  avatarMimeType?: string; // MIME type for Content-Type header
  avatarSizeBytes?: number; // File size for Content-Length header
  avatarWidth?: number; // Image width in pixels
  avatarHeight?: number; // Image height in pixels
  avatarUploadedAt?: Date; // Upload timestamp for cache control
}

export type UserRow = User;