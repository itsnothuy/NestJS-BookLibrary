import { Module } from '@nestjs/common';
import { BooksService } from '../service/books.service';
import { BooksController } from '../controller/books.controller';
import { BooksRepo } from '../books.repo';
import { MysqlModule } from 'src/database/mysql.module'; // provides MYSQL


@Module({
  imports: [MysqlModule],
  controllers: [BooksController],
  providers: [BooksService, BooksRepo], 
  exports: [BooksService],
})
export class BooksModule {}
