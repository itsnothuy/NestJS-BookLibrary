import { Test, TestingModule } from '@nestjs/testing';
import { BooksRepo } from './books.repo';
import mysql from 'mysql2/promise';

describe('BooksRepo', () => {
  let booksRepo: BooksRepo;
  let pool: mysql.Pool;

  beforeAll(async () => {
    pool = await mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    booksRepo = new BooksRepo(pool);
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test case to simulate duplicate ISBN insertion
  it('should handle duplicate ISBN gracefully', async () => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890123',
      publishedYear: 2025,
    };

    // Insert the first book
    const firstInsert = await booksRepo.create(bookData);
    expect(firstInsert).toBeDefined();
    expect(firstInsert.isbn).toBe(bookData.isbn);

    // Attempt to insert a duplicate book
    try {
      await booksRepo.create(bookData);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('Duplicate entry');
    }

    // Verify the fallback query retrieves the correct book
    const duplicateBook = await booksRepo.findByIsbn(bookData.isbn);
    expect(duplicateBook).toBeDefined();
    expect(duplicateBook?.isbn).toBe(bookData.isbn);
  });
});