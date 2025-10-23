import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

// Adjust these import paths to match your project:
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';


@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  // PUBLIC
  @Get()
  list() {
    return this.books.list();
  }

  // PUBLIC (validate that :id is a UUID)
  @Get(':id')
  get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
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
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.books.update(id, dto);
  }

  // ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.books.remove(id);
  }
}
