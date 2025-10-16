import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
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
    return Array.isArray(rows) ? rows[0] : null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM user WHERE id=? LIMIT 1', [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as UserRow : null;
  }

  async findAll(): Promise<UserRow[]> {
    const [rows] = await this.pool.execute('SELECT * FROM user ORDER BY createdAt DESC');
    return Array.isArray(rows) ? rows as UserRow[] : [];
  }

  async create(data: { id: string; email: string; passwordHash: string; role: 'student'|'admin' }): Promise<UserRow> {
    const [result] = await this.pool.execute('INSERT INTO user SET ?', [data]);
    return { ...data, id: result.insertId };
  }

  async update(id: string, patch: Partial<Pick<UserRow,'email'|'passwordHash'|'role'>>): Promise<UserRow> {
    const user = await this.findById(id);  
    if (!user) throw new Error('User not found');
    const email = patch.email ?? user.email;
    const passwordHash = patch.passwordHash ?? user.passwordHash;
    const role = patch.role ?? user.role;
    await this.pool.query('UPDATE user SET email=?, passwordHash=?, role=? WHERE id=?', [email, passwordHash, role, id]);
    return { ...user, email, passwordHash, role };
  }

  async remove(id: string): Promise<void> {
    await this.pool.query('DELETE FROM user WHERE id=?', [id]);
    return;
  }
}