import { Module } from '@nestjs/common';
import { BooksService } from '../service/books.service';
import { BooksController } from '../controller/books.controller';
import { BookCoverController } from '../controller/book-cover.controller';
import { BooksRepo } from '../books.repo';
import { MysqlModule } from 'src/database/mysql.module'; // provides MYSQL


@Module({
  imports: [MysqlModule],
  controllers: [BooksController, BookCoverController],
  providers: [BooksService, BooksRepo], 
  exports: [BooksService],
})
export class BooksModule {}
