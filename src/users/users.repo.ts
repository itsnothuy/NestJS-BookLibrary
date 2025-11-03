import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL } from '../database/mysql.module';
import { UserRow } from './entities/user.entity';

@Injectable()
export class UsersRepo {
  constructor(@Inject(MYSQL) private pool: Pool) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    const arr = rows as any[];
    return arr[0] ?? null;
  }

  async findByUuid(uuid: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE uuid=? LIMIT 1', [uuid]);
    const arr = rows as any[];
    return arr[0] ?? null;
  }

  async findById(id: number): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
    const arr = rows as any[];
    return arr[0] ?? null;
  }

  async findAll(): Promise<UserRow[]> {
    const [rows] = await this.pool.query('SELECT * FROM users ORDER BY createdAt DESC');
    return rows as any[];
  }

  async create(data: { email: string; passwordHash: string; role: 'student'|'admin' }): Promise<UserRow> {
    const [result] = await this.pool.query(
      'INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)',
      [data.email, data.passwordHash, data.role],
    );
    const insertId = (result as any).insertId;
    return (await this.findById(insertId))!;
  }

  async updateByUuid(uuid: string, patch: Partial<Pick<UserRow,'email'|'passwordHash'|'role'>>): Promise<UserRow | null> {
    const user = await this.findByUuid(uuid);  
    if (!user) return null;
    
    const fields: string[] = [];
    const params: any[] = [];
    
    if (patch.email !== undefined) { fields.push('email = ?'); params.push(patch.email); }
    if (patch.passwordHash !== undefined) { fields.push('passwordHash = ?'); params.push(patch.passwordHash); }
    if (patch.role !== undefined) { fields.push('role = ?'); params.push(patch.role); }
    
    if (fields.length === 0) {
      return user;
    }
    
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE uuid = ?`;
    params.push(uuid);
    
    await this.pool.query(sql, params);
    return await this.findByUuid(uuid);
  }

  async removeByUuid(uuid: string): Promise<boolean> {
    const [result] = await this.pool.query('DELETE FROM users WHERE uuid=?', [uuid]);
    return (result as any).affectedRows > 0;
  }
}