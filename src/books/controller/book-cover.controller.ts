import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { BooksRepo } from '../books.repo';

@Controller('uploads/book-covers')
export class BookCoverController {
  constructor(private readonly repo: BooksRepo) {}

  @Get(':filename')
  async serveCover(@Param('filename') filename: string, @Res() res: Response) {
    // Find the book by coverImageFilename
    const book = await this.repo.findAll().then(books => 
      books.find(b => b.coverImageFilename === filename)
    );

    if (!book || !book.coverImageFilename) {
      throw new NotFoundException('Book cover not found');
    }

    const coverPath = path.join('./uploads/book-covers', book.coverImageFilename);

    if (!fs.existsSync(coverPath)) {
      throw new NotFoundException('Cover file not found');
    }

    return res.sendFile(path.resolve(coverPath));
  }
}
