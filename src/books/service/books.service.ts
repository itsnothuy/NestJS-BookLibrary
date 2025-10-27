import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BookRow, BooksRepo } from '../books.repo';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BooksService {
  constructor(private readonly repo: BooksRepo) {}
  
  list(): Promise<BookRow[]> {
    return this.repo.findAll();
  }

  async get(id: string): Promise<BookRow> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Book not found');
    return found;
  }
  
  async create(input: CreateBookDto): Promise<BookRow> {
    // ValidationPipe now handles validation, so we can remove manual checks
    const dup = await this.repo.findByIsbn(input.isbn);
    if (dup) throw new ConflictException('ISBN already exists');
    return this.repo.create({
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publishedYear: input.publishedYear ?? null,
    });
  }

  findAll() {
    // return this.repo.findAll();
  }

  findOne(id: number) {
    // return this.repo.findById(id);
  }

  async update(id: string, patch: UpdateBookDto): Promise<BookRow> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Book not found');
    const updated = await this.repo.updateById(id, patch);
    if (!updated) throw new NotFoundException('Failed to update book');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Book not found');
    await this.repo.deleteById(id);
  }
}
