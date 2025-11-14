export interface User {
  id: number; // Internal auto-increment ID (not exposed to client)
  uuid: string; // Public-facing UUID
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  avatarFilename?: string; //  avatar-123456789.jpg
}

export type UserRow = User;