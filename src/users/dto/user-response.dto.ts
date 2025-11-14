import { UserRow } from '../entities/user.entity';

export class UserResponseDto {
  id: string; // This will be the UUID
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  // Avatar fields - Filesystem storage (only URL)
  avatarUrl?: string; // URL to filesystem avatar

  static fromEntity(user: UserRow): UserResponseDto {
    // For simplified filesystem storage, construct URL from filename
    let avatarUrl: string | undefined = undefined;
    if (user.avatarFilename) {
      avatarUrl = `/uploads/avatars/${user.avatarFilename}`;
    }
    
    return {
      id: user.uuid, // Expose UUID as 'id' to client
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      avatarUrl: avatarUrl,
    };
  }
}