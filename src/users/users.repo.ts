import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL } from '../database/mysql.module';

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  role: 'student'|'admin';
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class UsersRepo {
  constructor(@Inject(MYSQL) private pool: Pool) {}

  async findByEmail(email: string) {
    const [rows] = await this.pool.execute('SELECT * FROM user WHERE email=? LIMIT 1', [email]);
    const arr = rows as any[];
    return arr[0] ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM user WHERE id=? LIMIT 1', [id]);
    const arr = rows as any[];
    return arr[0] ?? null;
  }

  async findAll(): Promise<UserRow[]> {
    const [rows] = await this.pool.query('SELECT id, email, role, createdAt, updatedAt FROM user ORDER BY createdAt DESC');
    return rows as any[];
  }

  async create(data: { id: string; email: string; passwordHash: string; role: 'student'|'admin' }): Promise<UserRow> {
    await this.pool.query(
      'INSERT INTO user (id, email, passwordHash, role) VALUES (?, ?, ?, ?)',
      [data.id, data.email, data.passwordHash, data.role],
    );
    return (await this.findById(data.id))!;
  }

  async update(id: string, patch: Partial<Pick<UserRow,'email'|'passwordHash'|'role'>>): Promise<UserRow> {
    const user = await this.findById(id);  
    if (!user) throw new Error('User not found');
    const email = patch.email ?? user.email;
    const passwordHash = patch.passwordHash ?? user.passwordHash;
    const role = patch.role ?? user.role;
    await this.pool.query('UPDATE user SET email=?, passwordHash=?, role=? WHERE id=?', [email, passwordHash, role, id]);
    return (await this.findById(id))!;
  }

  async remove(id: string): Promise<void> {
    await this.pool.query('DELETE FROM user WHERE id=?', [id]);
    return;
  }
}