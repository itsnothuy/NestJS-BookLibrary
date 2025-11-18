import { BookRow } from '../entities/book.entity';

export class BookResponseDto {
  id: string; // This will be the UUID
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageUrl?: string; // Public URL to the cover image
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(book: BookRow): BookResponseDto {
    let coverImageUrl: string | undefined = undefined;
    if (book.coverImageFilename) {
      coverImageUrl = `/uploads/book-covers/${book.coverImageFilename}`;
    }

    return {
      id: book.uuid, // Expose UUID as 'id' to client
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      coverImageUrl,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }
}