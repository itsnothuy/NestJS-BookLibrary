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
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}
  
  @Get() 
  findAll() { 
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

  // Avatar upload endpoint for any user to upload their own avatar
  @UseGuards(JwtAuthGuard) // Remove admin role requirement for own avatar
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads', 'avatars');
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const user = (req as any).user;
        const ext = extname(file.originalname);
        const filename = `avatar-${user.uuid}-${Date.now()}${ext}`;
        cb(null, filename);
      },
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

  // Serve avatar files
  @Get('avatar/:filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const path = join(process.cwd(), 'uploads', 'avatars', filename);
    if (existsSync(path)) {
      return res.sendFile(path);
    } else {
      return res.status(404).json({ message: 'Avatar not found' });
    }
  }
}
