import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';

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

  // PUBLIC
  @Get(':id')
  get(@Param('id') id: string) {
    return this.books.get(id);
  }

  // ADMIN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.books.create(body);
  }

  // ADMIN
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.books.update(id, body);
  }

  // ADMIN
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.books.remove(id);
  }
}
