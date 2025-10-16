import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  @Get() findAll() { return this.users.findAll(); }
  @Post() create(@Body() b: any) { return this.users.create(b); }
  @Get(':id') findOne(@Param('id') id: string) { return this.users.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() b: any) { return this.users.update(id, b); }
  @Delete(':id') remove(@Param('id') id: string) { return this.users.remove(id); }
}
