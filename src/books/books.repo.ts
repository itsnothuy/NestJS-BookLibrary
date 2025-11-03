import { Inject, Injectable } from '@nestjs/common';
import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { MYSQL } from 'src/database/mysql.module';
import { BookRow } from './entities/book.entity';

@Injectable()
export class BooksRepo {
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
