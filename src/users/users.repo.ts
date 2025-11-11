import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL } from '../database/mysql.module';
import { UserRow } from './entities/user.entity';
import { PaginatedRepository } from '../common/interfaces/paginated-repository.interface';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginationResultDto } from '../common/dto/pagination-result.dto';

@Injectable()
export class UsersRepo implements PaginatedRepository<UserRow> {
  constructor(@Inject(MYSQL) private pool: Pool) {}

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
      avatarMimeType: row.avatar_mime_type,
      avatarSizeBytes: row.avatar_size_bytes,
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

  async findManyPaginated(
    options: PaginationQueryDto,
    filters: { role?: string; search?: string } = {}
  ): Promise<PaginationResultDto<UserRow>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'desc';
    const search = options.search;
    
    const offset = (page - 1) * limit;

    // Build dynamic WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.role) {
      conditions.push('role = ?');
      params.push(filters.role);
    }

    if (search || filters.search) {
      const searchTerm = search || filters.search;
      conditions.push('(email LIKE ? OR role LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';

    const allowedSortFields = ['id', 'email', 'role', 'createdAt', 'updatedAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await this.pool.query(countQuery, params);
    const total = (countResult as any[])[0].total;

    const dataQuery = `
      SELECT * FROM users 
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    const [dataResult] = await this.pool.query(dataQuery, [...params, limit, offset]);

    const users = (dataResult as any[])
      .map(row => this.mapDbRowToUser(row))
      .filter((user): user is UserRow => user !== null);
    
    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      links: this.generatePaginationLinks('users', page, totalPages, limit)
    };
  }

  private generatePaginationLinks(resource: string, page: number, totalPages: number, limit: number) {
    const baseUrl = `/${resource}`;
    return {
      first: `${baseUrl}?page=1&limit=${limit}`,
      previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : undefined,
      next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : undefined,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
    };
  }

  async create(data: { email: string; passwordHash: string; role: 'student'|'admin' }): Promise<UserRow> {
    const [result] = await this.pool.query(
      'INSERT INTO users (email, passwordHash, role) VALUES (?, ?, ?)',
      [data.email, data.passwordHash, data.role],
    );
    const insertId = (result as any).insertId;
    return (await this.findById(insertId))!;
  }

  async updateByUuid(uuid: string, patch: Partial<Pick<UserRow,'email'|'passwordHash'|'role'|'avatarFilename'|'avatarMimeType'|'avatarSizeBytes'|'avatarUploadedAt'>>): Promise<UserRow | null> {
    const user = await this.findByUuid(uuid);  
    if (!user) return null;
    
    const fields: string[] = [];
    const params: any[] = [];
    
    if (patch.email !== undefined) { fields.push('email = ?'); params.push(patch.email); }
    if (patch.passwordHash !== undefined) { fields.push('passwordHash = ?'); params.push(patch.passwordHash); }
    if (patch.role !== undefined) { fields.push('role = ?'); params.push(patch.role); }
    if (patch.avatarFilename !== undefined) { fields.push('avatar_filename = ?'); params.push(patch.avatarFilename); }
    if (patch.avatarMimeType !== undefined) { fields.push('avatar_mime_type = ?'); params.push(patch.avatarMimeType); }
    if (patch.avatarSizeBytes !== undefined) { fields.push('avatar_size_bytes = ?'); params.push(patch.avatarSizeBytes); }
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