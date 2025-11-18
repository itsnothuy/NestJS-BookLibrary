import { Body, Controller, Get, Post, Req, UseGuards, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { UsersService } from '../../users/service/users.service';


@Controller('auth')
export class AuthController {
    constructor(
        private auth: AuthService,
        private users: UsersService
    ) {}

    @Post('signup') signup(@Body() b: any) { return this.auth.signup(b.email, b.password, b.role); }
    @Post('login')  login(@Body() b: any)  { return this.auth.login(b.email, b.password); }

    @UseGuards(JwtAuthGuard)
    @Get('me') 
    async me(@Req() req: any) { 
        return this.users.findOne(req.user.uuid);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(@Req() req: any, @Body() body: any) { 
        return this.auth.updateProfile(req.user.uuid, body); 
    }

    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads/avatars';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                // Generate safe filename with timestamp
                const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
                const safeFilename = `avatar-${Date.now()}.${ext}`;
                cb(null, safeFilename);
            }
        }),
        fileFilter: (req, file, cb) => {
            // Validate MIME type
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        return this.users.updateAvatar(req.user.uuid, file);
    }
}
 