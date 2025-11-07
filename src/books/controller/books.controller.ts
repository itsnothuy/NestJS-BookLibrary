import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe, Query,
} from '@nestjs/common';
import { BooksService } from '../service/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

// Adjust these import paths to match your project:
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';


@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  // PUBLIC
  @Get()
  list(@Query() query: PaginationQueryDto, @Query('author') author?: string, @Query('publishedYear') publishedYear?: number) {
    // If any pagination parameters are provided, use pagination
    if (query.page || query.limit || query.sortBy || query.sortOrder || query.search || author || publishedYear) {
      return this.books.listPaginated(query, { author, publishedYear });
    }
    // Otherwise, return all books (backward compatibility)
    return this.books.list();
  }

  // PUBLIC (validate that :id is a UUID)
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.books.get(id);
  }

  // ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateBookDto) {
    return this.books.create(dto);
  }

  // ADMIN
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.books.update(id, dto);
  }

  // ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.books.remove(id);
  }
}
