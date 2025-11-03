import { UserRow } from '../entities/user.entity';

export class UserResponseDto {
  id: string; // This will be the UUID
  email: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: UserRow): UserResponseDto {
    return {
      id: user.uuid, // Expose UUID as 'id' to client
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}