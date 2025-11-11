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

  @UseGuards(JwtAuthGuard) // Remove admin role requirement for own avatar
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/avatars';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `avatar-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    return this.users.updateAvatar((req as any).user.uuid, file);
  }

}
