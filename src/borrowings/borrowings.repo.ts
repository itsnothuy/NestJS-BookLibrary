import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { MYSQL } from 'src/database/mysql.module';
import {
  BorrowingRequestRow,
  BorrowingRequestWithDetails,
} from './entities/borrowing-request.entity';
import {
  BorrowingRow,
  BorrowingWithDetails,
  BookInventoryRow,
} from './entities/borrowing.entity';

@Injectable()
export class BorrowingsRepo {
  private readonly logger = new Logger(BorrowingsRepo.name);

  constructor(@Inject(MYSQL) private readonly pool: Pool) {}

  // ============= BORROWING REQUESTS =============

  async createRequest(data: {
    userId: number;
    bookId: number;
    requestedDays: number;
  }): Promise<BorrowingRequestRow> {
    const sql = `
      INSERT INTO borrowing_requests (userId, bookId, requestedDays)
      VALUES (?, ?, ?)
    `;
    const params = [data.userId, data.bookId, data.requestedDays];
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    const created = await this.findRequestById(result.insertId);
    if (!created) {
      throw new Error('Failed to create borrowing request');
    }
    return created;
  }

  async findRequestById(id: number): Promise<BorrowingRequestRow | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM borrowing_requests WHERE id = ?',
      [id]
    );
    return rows[0] as BorrowingRequestRow | null;
  }

  async findRequestByUuid(uuid: string): Promise<BorrowingRequestRow | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM borrowing_requests WHERE uuid = ?',
      [uuid]
    );
    return rows[0] as BorrowingRequestRow | null;
  }

  async findRequestByUuidWithDetails(
    uuid: string
  ): Promise<BorrowingRequestWithDetails | null> {
    const sql = `
      SELECT 
        br.*,
        u.uuid as userUuid,
        u.email as userEmail,
        u.role as userRole,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.coverImageFilename as bookCover,
        p.uuid as processorUuid,
        p.email as processorEmail
      FROM borrowing_requests br
      LEFT JOIN users u ON br.userId = u.id
      LEFT JOIN book b ON br.bookId = b.id
      LEFT JOIN users p ON br.processedBy = p.id
      WHERE br.uuid = ?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [uuid]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return this.mapRequestRowWithDetails(row);
  }

  async findPendingRequestsByUser(userId: number): Promise<BorrowingRequestRow[]> {
    const sql = `
      SELECT * FROM borrowing_requests
      WHERE userId = ? AND status = 'pending'
      ORDER BY requestedAt DESC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [userId]);
    return rows as BorrowingRequestRow[];
  }

  async findAllRequestsByUser(userId: number): Promise<BorrowingRequestWithDetails[]> {
    const sql = `
      SELECT 
        br.*,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.coverImageFilename as bookCover
      FROM borrowing_requests br
      LEFT JOIN book b ON br.bookId = b.id
      WHERE br.userId = ?
      ORDER BY br.requestedAt DESC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [userId]);
    return rows.map((row: any) => this.mapRequestRowWithDetails(row));
  }

  async findAllPendingRequests(): Promise<BorrowingRequestWithDetails[]> {
    const sql = `
      SELECT 
        br.*,
        u.uuid as userUuid,
        u.email as userEmail,
        u.role as userRole,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.coverImageFilename as bookCover
      FROM borrowing_requests br
      LEFT JOIN users u ON br.userId = u.id
      LEFT JOIN book b ON br.bookId = b.id
      WHERE br.status = 'pending'
      ORDER BY br.requestedAt ASC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql);
    return rows.map((row: any) => this.mapRequestRowWithDetails(row));
  }

  async processRequest(
    requestId: number,
    adminId: number,
    status: 'approved' | 'rejected' | 'cancelled',
    rejectionReason?: string
  ): Promise<BorrowingRequestRow> {
    const sql = `
      UPDATE borrowing_requests
      SET status = ?, processedBy = ?, processedAt = NOW(), rejectionReason = ?
      WHERE id = ?
    `;
    const params = [status, adminId, rejectionReason || null, requestId];
    await this.pool.execute<ResultSetHeader>(sql, params);
    const updated = await this.findRequestById(requestId);
    if (!updated) {
      throw new Error('Failed to update request');
    }
    return updated;
  }

  // ============= BORROWINGS =============

  async createBorrowing(data: {
    userId: number;
    bookId: number;
    requestId: number | null;
    dueDate: Date;
    borrowNotes?: string;
  }): Promise<BorrowingRow> {
    const sql = `
      INSERT INTO borrowings (userId, bookId, requestId, dueDate, borrowNotes)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      data.userId,
      data.bookId,
      data.requestId,
      data.dueDate,
      data.borrowNotes || null,
    ];
    const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
    const created = await this.findBorrowingById(result.insertId);
    if (!created) {
      throw new Error('Failed to create borrowing');
    }
    return created;
  }

  async findBorrowingById(id: number): Promise<BorrowingRow | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM borrowings WHERE id = ?',
      [id]
    );
    return rows[0] as BorrowingRow | null;
  }

  async findBorrowingByUuid(uuid: string): Promise<BorrowingRow | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      'SELECT * FROM borrowings WHERE uuid = ?',
      [uuid]
    );
    return rows[0] as BorrowingRow | null;
  }

  async findBorrowingByUuidWithDetails(
    uuid: string
  ): Promise<BorrowingWithDetails | null> {
    const sql = `
      SELECT 
        bw.*,
        u.uuid as userUuid,
        u.email as userEmail,
        u.role as userRole,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.publishedYear as bookPublishedYear,
        b.coverImageFilename as bookCover
      FROM borrowings bw
      LEFT JOIN users u ON bw.userId = u.id
      LEFT JOIN book b ON bw.bookId = b.id
      WHERE bw.uuid = ?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [uuid]);

    if (rows.length === 0) return null;

    const row = rows[0] as any;
    return this.mapBorrowingRowWithDetails(row);
  }

  async findActiveBorrowingsByUser(userId: number): Promise<BorrowingWithDetails[]> {
    const sql = `
      SELECT 
        bw.*,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.publishedYear as bookPublishedYear,
        b.coverImageFilename as bookCover
      FROM borrowings bw
      LEFT JOIN book b ON bw.bookId = b.id
      WHERE bw.userId = ? AND bw.status IN ('active', 'overdue')
      ORDER BY bw.dueDate ASC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [userId]);
    return rows.map((row: any) => this.mapBorrowingRowWithDetails(row));
  }

  async findBorrowingHistoryByUser(userId: number): Promise<BorrowingWithDetails[]> {
    const sql = `
      SELECT 
        bw.*,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.publishedYear as bookPublishedYear,
        b.coverImageFilename as bookCover
      FROM borrowings bw
      LEFT JOIN book b ON bw.bookId = b.id
      WHERE bw.userId = ? AND bw.status = 'returned'
      ORDER BY bw.returnedAt DESC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [userId]);
    return rows.map((row: any) => this.mapBorrowingRowWithDetails(row));
  }

  async findOverdueBorrowings(): Promise<BorrowingWithDetails[]> {
    const sql = `
      SELECT 
        bw.*,
        u.uuid as userUuid,
        u.email as userEmail,
        u.role as userRole,
        b.uuid as bookUuid,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.isbn as bookIsbn,
        b.publishedYear as bookPublishedYear,
        b.coverImageFilename as bookCover
      FROM borrowings bw
      LEFT JOIN users u ON bw.userId = u.id
      LEFT JOIN book b ON bw.bookId = b.id
      WHERE bw.status = 'overdue' OR (bw.status = 'active' AND bw.dueDate < NOW())
      ORDER BY bw.dueDate ASC
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql);
    return rows.map((row: any) => this.mapBorrowingRowWithDetails(row));
  }

  async returnBook(borrowingId: number, returnNotes?: string): Promise<BorrowingRow> {
    const sql = `
      UPDATE borrowings
      SET 
        status = 'returned',
        returnedAt = NOW(),
        returnNotes = ?
      WHERE id = ?
    `;
    await this.pool.execute<ResultSetHeader>(sql, [returnNotes || null, borrowingId]);
    const updated = await this.findBorrowingById(borrowingId);
    if (!updated) {
      throw new Error('Failed to update borrowing');
    }
    return updated;
  }

  async calculateLateFee(borrowingId: number): Promise<number> {
    const borrowing = await this.findBorrowingById(borrowingId);
    if (!borrowing) return 0;

    const now = new Date();
    const dueDate = new Date(borrowing.dueDate);

    if (now <= dueDate) return 0;

    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const lateFee = Math.min(daysOverdue * borrowing.lateFeePerDay, 25.0); // Max $25

    // Update the borrowing record with calculated late fee
    const updateSql = `
      UPDATE borrowings
      SET daysOverdue = ?, lateFeeAmount = ?, status = 'overdue'
      WHERE id = ?
    `;
    await this.pool.execute<ResultSetHeader>(updateSql, [daysOverdue, lateFee, borrowingId]);

    return lateFee;
  }

  // ============= BOOK INVENTORY =============

  async isBookAvailable(bookId: number): Promise<boolean> {
    const sql = `
      SELECT availableCopies FROM book_inventory
      WHERE bookId = ?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [bookId]);
    
    if (rows.length === 0) {
      // No inventory record, assume 1 copy available
      return true;
    }

    const inventory = rows[0] as BookInventoryRow;
    return inventory.availableCopies > 0;
  }

  async getBookInventory(bookId: number): Promise<BookInventoryRow | null> {
    const sql = `SELECT * FROM book_inventory WHERE bookId = ?`;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [bookId]);
    return rows[0] as BookInventoryRow | null;
  }

  async decrementAvailableCopies(bookId: number): Promise<void> {
    const sql = `
      UPDATE book_inventory
      SET availableCopies = availableCopies - 1
      WHERE bookId = ? AND availableCopies > 0
    `;
    await this.pool.execute<ResultSetHeader>(sql, [bookId]);
  }

  async incrementAvailableCopies(bookId: number): Promise<void> {
    const sql = `
      UPDATE book_inventory
      SET availableCopies = availableCopies + 1
      WHERE bookId = ?
    `;
    await this.pool.execute<ResultSetHeader>(sql, [bookId]);
  }

  async getBookBorrowingStats(bookId: number): Promise<{
    totalBorrowings: number;
    activeBorrowings: number;
    averageBorrowDays: number;
  }> {
    const sql = `
      SELECT 
        COUNT(*) as totalBorrowings,
        SUM(CASE WHEN status IN ('active', 'overdue') THEN 1 ELSE 0 END) as activeBorrowings,
        COALESCE(AVG(DATEDIFF(COALESCE(returnedAt, NOW()), borrowedAt)), 0) as averageBorrowDays
      FROM borrowings
      WHERE bookId = ?
    `;
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [bookId]);
    const result = rows[0] as any;
    
    return {
      totalBorrowings: Number(result.totalBorrowings) || 0,
      activeBorrowings: Number(result.activeBorrowings) || 0,
      averageBorrowDays: Number(result.averageBorrowDays) || 0,
    };
  }

  // ============= HELPER METHODS =============

  private mapRequestRowWithDetails(row: any): BorrowingRequestWithDetails {
    return {
      id: row.id,
      uuid: row.uuid,
      userId: row.userId,
      bookId: row.bookId,
      status: row.status,
      requestedAt: row.requestedAt,
      requestedDays: row.requestedDays,
      processedBy: row.processedBy,
      processedAt: row.processedAt,
      rejectionReason: row.rejectionReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.userUuid && {
        user: {
          id: row.userId,
          uuid: row.userUuid,
          email: row.userEmail,
          role: row.userRole,
        },
      }),
      ...(row.bookUuid && {
        book: {
          id: row.bookId,
          uuid: row.bookUuid,
          title: row.bookTitle,
          author: row.bookAuthor,
          isbn: row.bookIsbn,
          coverImageFilename: row.bookCover,
        },
      }),
      ...(row.processorUuid && {
        processor: {
          id: row.processedBy,
          uuid: row.processorUuid,
          email: row.processorEmail,
        },
      }),
    };
  }

  private mapBorrowingRowWithDetails(row: any): BorrowingWithDetails {
    return {
      id: row.id,
      uuid: row.uuid,
      userId: row.userId,
      bookId: row.bookId,
      requestId: row.requestId,
      borrowedAt: row.borrowedAt,
      dueDate: row.dueDate,
      returnedAt: row.returnedAt,
      status: row.status,
      daysOverdue: row.daysOverdue,
      lateFeeAmount: Number(row.lateFeeAmount),
      lateFeePerDay: Number(row.lateFeePerDay),
      borrowNotes: row.borrowNotes,
      returnNotes: row.returnNotes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.userUuid && {
        user: {
          id: row.userId,
          uuid: row.userUuid,
          email: row.userEmail,
          role: row.userRole,
        },
      }),
      ...(row.bookUuid && {
        book: {
          id: row.bookId,
          uuid: row.bookUuid,
          title: row.bookTitle,
          author: row.bookAuthor,
          isbn: row.bookIsbn,
          publishedYear: row.bookPublishedYear,
          coverImageFilename: row.bookCover,
        },
      }),
    };
  }
}
