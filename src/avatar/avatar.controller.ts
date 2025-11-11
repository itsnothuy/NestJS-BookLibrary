import { Controller, Get, Param, Res, NotFoundException, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UsersRepo } from '../users/users.repo';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly usersRepo: UsersRepo) {}

  @Get(':uuid')
  async getAvatar(@Param('uuid') uuid: string, @Res() res: Response) {
    // Find user by UUID and get avatar filename
    const user = await this.usersRepo.findByUuid(uuid);

    if (!user || !user.avatarFilename) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    // Construct file path from hardcoded directory and stored filename
    const avatarPath = path.join('./uploads/avatars', user.avatarFilename);
    const absolutePath = path.resolve(avatarPath);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Avatar file not found on server' });
    }

    // Set proper headers for file serving
    res.setHeader('Content-Type', user.avatarMimeType || 'image/jpeg');
    
    // Set cache headers for better performance
    if (user.avatarUploadedAt) {
      res.setHeader('Last-Modified', user.avatarUploadedAt.toUTCString());
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }

    // Send the file using express static file serving
    return res.sendFile(absolutePath);
  }
}