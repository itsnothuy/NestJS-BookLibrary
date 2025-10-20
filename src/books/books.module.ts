import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BooksRepo } from './books.repo';
import { MysqlModule } from 'src/database/mysql.module'; // provides MYSQL_POOL


@Module({
  imports: [MysqlModule],
  controllers: [BooksController],
  providers: [BooksService, BooksRepo], 
  exports: [BooksService],
})
export class BooksModule {}
