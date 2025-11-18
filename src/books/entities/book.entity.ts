export interface Book {
  id: number; // Internal auto-increment ID (not exposed to client)
  uuid: string; // Public-facing UUID
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageFilename?: string; // book-cover-123456789.jpg
  createdAt: Date;
  updatedAt: Date;
}

export type BookRow = Book;
