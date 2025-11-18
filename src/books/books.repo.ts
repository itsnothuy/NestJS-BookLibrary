import { Inject, Injectable } from '@nestjs/common';
import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { MYSQL } from 'src/database/mysql.module';
import { BookRow } from './entities/book.entity';
import { PaginatedRepository } from '../common/interfaces/paginated-repository.interface';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginationResultDto } from '../common/dto/pagination-result.dto';

@Injectable()
export class BooksRepo implements PaginatedRepository<BookRow> {
    constructor(@Inject(MYSQL) private readonly pool: Pool) {}

    async create(data: { title: string; author: string; isbn: string; publishedYear?: number | null }): Promise<BookRow> {
        const sql =
            'INSERT INTO book (title, author, isbn, publishedYear) VALUES (?, ?, ?, ?)';
        const params = [data.title, data.author, data.isbn, data.publishedYear ?? null];
        const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
        const insertId = result.insertId;
        const created = await this.findById(insertId);
        if (!created) {
            throw new Error('Failed to create book');
        }
        return created;
    }

    async findAll(): Promise<BookRow[]> {
        const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM book ORDER BY createdAt DESC');
        return rows as BookRow[];
    }

    async findManyPaginated(
        options: PaginationQueryDto,
        filters: { author?: string; search?: string; publishedYear?: number } = {}
    ): Promise<PaginationResultDto<BookRow>> {
        const page = options.page ?? 1;
        const limit = options.limit ?? 10;
        const sortBy = options.sortBy ?? 'createdAt';
        const sortOrder = options.sortOrder ?? 'desc';
        const search = options.search;
        
        const offset = (page - 1) * limit;

        // Build dynamic WHERE clause
        const conditions: string[] = [];
        const params: any[] = [];

        if (filters.author) {
            conditions.push('author = ?');
            params.push(filters.author);
        }

        if (filters.publishedYear) {
            conditions.push('publishedYear = ?');
            params.push(filters.publishedYear);
        }

        if (search || filters.search) {
            const searchTerm = search || filters.search;
            conditions.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ?)');
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }

        const whereClause = conditions.length > 0 
            ? `WHERE ${conditions.join(' AND ')}` 
            : '';

        // Validate sortBy to prevent SQL injection
        const allowedSortFields = ['id', 'title', 'author', 'isbn', 'publishedYear', 'createdAt', 'updatedAt'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM book ${whereClause}`;
        const [countResult] = await this.pool.query<RowDataPacket[]>(countQuery, params);
        const total = (countResult[0] as any).total;

        // Get paginated data
        const dataQuery = `
            SELECT * FROM book 
            ${whereClause}
            ORDER BY ${safeSortBy} ${safeSortOrder}
            LIMIT ? OFFSET ?
        `;
        const [dataResult] = await this.pool.query<RowDataPacket[]>(dataQuery, [...params, limit, offset]);

        const books = dataResult as BookRow[];
        const totalPages = Math.ceil(total / limit);

        return {
            data: books,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            links: this.generatePaginationLinks('books', page, totalPages, limit)
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

    async findByUuid(uuid: string): Promise<BookRow | null> {
        const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM book WHERE uuid = ?', [uuid]);
        return rows[0] as BookRow | null;
    }

    async findById(id: number): Promise<BookRow | null> {
        const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM book WHERE id = ?', [id]);
        return rows[0] as BookRow | null;
    }

    async findByIsbn(isbn: string): Promise<BookRow | null> {
        const [rows] = await this.pool.query<RowDataPacket[]>('SELECT * FROM book WHERE isbn = ?', [isbn]);
        return rows[0] as BookRow | null;
    }

    async updateByUuid(uuid: string, patch: Partial<Omit<BookRow, 'id' | 'uuid' | 'createdAt' | 'updatedAt'>>): Promise<BookRow | null> {
        const fields: string[] = [];
        const params: any[] = [];

        if (patch.title !== undefined) { fields.push('title = ?'); params.push(patch.title); }
        if (patch.author !== undefined) { fields.push('author = ?'); params.push(patch.author); }
        if (patch.isbn !== undefined) { fields.push('isbn = ?'); params.push(patch.isbn); }
        if (patch.publishedYear !== undefined) { fields.push('publishedYear = ?'); params.push(patch.publishedYear); }
        if (patch.coverImageFilename !== undefined) { fields.push('coverImageFilename = ?'); params.push(patch.coverImageFilename); }

        if (fields.length === 0) {
            return this.findByUuid(uuid);
        }

        const sql = `UPDATE book SET ${fields.join(', ')} WHERE uuid = ?`;
        params.push(uuid);

        await this.pool.execute<ResultSetHeader>(sql, params);
        return this.findByUuid(uuid);
    }

    async deleteByUuid(uuid: string): Promise<boolean> {
        const [result] = await this.pool.execute<ResultSetHeader>(
            'DELETE FROM book WHERE uuid = ?',
            [uuid],
        );
        return result.affectedRows > 0;
    }

    async deleteAll(): Promise<number> {
        const [result] = await this.pool.execute<ResultSetHeader>(
            'DELETE FROM book',
        );
        return result.affectedRows;
    }

    async count(): Promise<number> {
        const [rows] = await this.pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM book');
        return rows[0].count as number;
    }
}
