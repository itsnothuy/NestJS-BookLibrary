import { Module } from '@nestjs/common';
import { BorrowingsController } from '../controller/borrowings.controller';
import { BorrowingsService } from '../borrowings.service';
import { BorrowingsRepo } from '../borrowings.repo';
import { BooksModule } from '../../books/module/books.module';
import { MysqlModule } from '../../database/mysql.module';

@Module({
  imports: [BooksModule, MysqlModule],
  controllers: [BorrowingsController],
  providers: [BorrowingsService, BorrowingsRepo],
  exports: [BorrowingsService, BorrowingsRepo],
})
export class BorrowingsModule {}
