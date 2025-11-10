import { UserRow } from '../entities/user.entity';

export class UserResponseDto {
  id: string; // This will be the UUID
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - BLOB storage
  avatarUrl?: string; // URL to BLOB avatar endpoint
  avatarMimeType?: string;
  avatarSizeBytes?: number;
  avatarWidth?: number;
  avatarHeight?: number;
  avatarUploadedAt?: Date;

  static fromEntity(user: UserRow): UserResponseDto {
    // For BLOB storage, avatar URL points to /avatar/:uuid endpoint with cache-busting
    let avatarUrl: string | undefined = undefined;
    if (user.avatarData) {
      const baseUrl = `/avatar/${user.uuid}`;
      // Add cache-busting parameter to prevent browser caching old images
      const cacheParam = user.avatarUploadedAt 
        ? `?t=${new Date(user.avatarUploadedAt).getTime()}`
        : '';
      avatarUrl = `${baseUrl}${cacheParam}`;
    }
    
    return {
      id: user.uuid, // Expose UUID as 'id' to client
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatarUrl: avatarUrl, // BLOB avatar URL with cache-busting
      avatarMimeType: user.avatarMimeType,
      avatarSizeBytes: user.avatarSizeBytes,
      avatarWidth: user.avatarWidth,
      avatarHeight: user.avatarHeight,
      avatarUploadedAt: user.avatarUploadedAt,
    };
  }
}