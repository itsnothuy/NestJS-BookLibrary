import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Patch, 
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Request,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  
  @Get() 
  findAll(@Query() query: PaginationQueryDto, @Query('role') role?: string) { 
    if (query.page || query.limit || query.sortBy || query.sortOrder || query.search || role) {
      return this.users.findAllPaginated(query, { role });
    }
    return this.users.findAll(); 
  }
  
  @Post() 
  create(@Body() dto: CreateUserDto) { 
    return this.users.create(dto); 
  }
  
  @Get(':id') 
  findOne(@Param('id', ParseUUIDPipe) id: string) { 
    return this.users.findOne(id); 
  }
  
  @Patch(':id') 
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() dto: UpdateUserDto
  ) { 
    return this.users.update(id, dto); 
  }
  
  @Delete(':id') 
  remove(@Param('id', ParseUUIDPipe) id: string) { 
    return this.users.remove(id); 
  }
  
}
