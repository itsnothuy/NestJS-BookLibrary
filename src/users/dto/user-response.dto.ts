import { UserRow } from '../entities/user.entity';

export class UserResponseDto {
  id: string; // This will be the UUID
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - Filesystem storage
  avatarUrl?: string; // URL to filesystem avatar
  avatarMimeType?: string;
  avatarSizeBytes?: number;
  avatarUploadedAt?: Date;

  static fromEntity(user: UserRow): UserResponseDto {
    // For filesystem storage, use the stored avatarUrl directly
    let avatarUrl: string | undefined = user.avatarUrl || undefined;
    
    return {
      id: user.uuid, // Expose UUID as 'id' to client
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatarUrl: avatarUrl, // Direct filesystem URL
      avatarMimeType: user.avatarMimeType,
      avatarSizeBytes: user.avatarSizeBytes,
      avatarUploadedAt: user.avatarUploadedAt,
    };
  }
}