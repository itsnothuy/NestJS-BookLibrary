import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BooksRepo } from '../books.repo';
import { BookResponseDto } from '../dto/book-response.dto';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginationResultDto } from '../../common/dto/pagination-result.dto';

@Injectable()
export class BooksService {
  constructor(private readonly repo: BooksRepo) {}
  
  async list(): Promise<BookResponseDto[]> {
    const books = await this.repo.findAll();
    return books.map(book => BookResponseDto.fromEntity(book));
  }

  async listPaginated(
    query: PaginationQueryDto, 
    filters: { author?: string; publishedYear?: number } = {}
  ): Promise<PaginationResultDto<BookResponseDto>> {
    const result = await this.repo.findManyPaginated(query, filters);
    return {
      ...result,
      data: result.data.map(book => BookResponseDto.fromEntity(book))
    };
  }

  async get(uuid: string): Promise<BookResponseDto> {
    const found = await this.repo.findByUuid(uuid);
    if (!found) throw new NotFoundException('Book not found');
    return BookResponseDto.fromEntity(found);
  }
  
  async create(input: CreateBookDto): Promise<BookResponseDto> {
    // ValidationPipe now handles validation, so we can remove manual checks
    const dup = await this.repo.findByIsbn(input.isbn);
    if (dup) throw new ConflictException('ISBN already exists');
    const created = await this.repo.create({
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publishedYear: input.publishedYear ?? null,
    });
    return BookResponseDto.fromEntity(created);
  }

  async update(uuid: string, patch: UpdateBookDto): Promise<BookResponseDto> {
    const found = await this.repo.findByUuid(uuid);
    if (!found) throw new NotFoundException('Book not found');
    const updated = await this.repo.updateByUuid(uuid, patch);
    if (!updated) throw new NotFoundException('Failed to update book');
    return BookResponseDto.fromEntity(updated);
  }

  async remove(uuid: string): Promise<void> {
    const existing = await this.repo.findByUuid(uuid);
    if (!existing) throw new NotFoundException('Book not found');
    const deleted = await this.repo.deleteByUuid(uuid);
    if (!deleted) throw new NotFoundException('Failed to delete book');
  }
}
