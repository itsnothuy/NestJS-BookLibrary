import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL } from '../database/mysql.module';
import { UserRow } from './entities/user.entity';

@Injectable()
export class UsersRepo {
  constructor(@Inject(MYSQL) private pool: Pool) {}

  // Helper method to convert database row to UserRow object
  private mapDbRowToUser(row: any): UserRow | null {
    if (!row) return null;
    
    return {
      id: row.id,
      uuid: row.uuid,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      avatarFilename: row.avatar_filename,
      avatarPath: row.avatar_path,
      avatarUrl: row.avatar_url,
      avatarMimeType: row.avatar_mime_type,
      avatarSizeBytes: row.avatar_size_bytes,
      avatarWidth: row.avatar_width,
      avatarHeight: row.avatar_height,
      avatarUploadedAt: row.avatar_uploaded_at,
    };
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    const arr = rows as any[];
    return this.mapDbRowToUser(arr[0]);
  }

  async findByUuid(uuid: string): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE uuid=? LIMIT 1', [uuid]);
    const arr = rows as any[];
    return this.mapDbRowToUser(arr[0]);
  }

  async findById(id: number): Promise<UserRow | null> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE id=? LIMIT 1', [id]);
    const arr = rows as any[];
    return this.mapDbRowToUser(arr[0]);
  }

  async findAll(): Promise<UserRow[]> {
    const [rows] = await this.pool.query('SELECT * FROM users ORDER BY createdAt DESC');
    return (rows as any[]).map(row => this.mapDbRowToUser(row)).filter(user => user !== null);
  }

  async create(data: { email: string; passwordHash: string; role: 'student'|'admin' }): Promise<UserRow> {
    const [result] = await this.pool.query(
      'INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)',
      [data.email, data.passwordHash, data.role],
    );
    const insertId = (result as any).insertId;
    return (await this.findById(insertId))!;
  }

  async updateByUuid(uuid: string, patch: Partial<Pick<UserRow,'email'|'passwordHash'|'role'|'avatarFilename'|'avatarPath'|'avatarUrl'|'avatarMimeType'|'avatarSizeBytes'|'avatarWidth'|'avatarHeight'|'avatarUploadedAt'>>): Promise<UserRow | null> {
    const user = await this.findByUuid(uuid);  
    if (!user) return null;
    
    const fields: string[] = [];
    const params: any[] = [];
    
    if (patch.email !== undefined) { fields.push('email = ?'); params.push(patch.email); }
    if (patch.passwordHash !== undefined) { fields.push('passwordHash = ?'); params.push(patch.passwordHash); }
    if (patch.role !== undefined) { fields.push('role = ?'); params.push(patch.role); }
    if (patch.avatarFilename !== undefined) { fields.push('avatar_filename = ?'); params.push(patch.avatarFilename); }
    if (patch.avatarPath !== undefined) { fields.push('avatar_path = ?'); params.push(patch.avatarPath); }
    if (patch.avatarUrl !== undefined) { fields.push('avatar_url = ?'); params.push(patch.avatarUrl); }
    if (patch.avatarMimeType !== undefined) { fields.push('avatar_mime_type = ?'); params.push(patch.avatarMimeType); }
    if (patch.avatarSizeBytes !== undefined) { fields.push('avatar_size_bytes = ?'); params.push(patch.avatarSizeBytes); }
    if (patch.avatarWidth !== undefined) { fields.push('avatar_width = ?'); params.push(patch.avatarWidth); }
    if (patch.avatarHeight !== undefined) { fields.push('avatar_height = ?'); params.push(patch.avatarHeight); }
    if (patch.avatarUploadedAt !== undefined) { fields.push('avatar_uploaded_at = ?'); params.push(patch.avatarUploadedAt); }
    
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