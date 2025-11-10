import { Controller, Get, Param, Res, NotFoundException, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { UsersRepo } from '../users/users.repo';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly usersRepo: UsersRepo) {}

  @Get(':uuid')
  async getAvatar(@Param('uuid') uuid: string, @Res() res: Response) {
    // Find user by UUID and get avatar data
    const user = await this.usersRepo.findByUuid(uuid);

    if (!user || !user.avatarData) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    // Set proper headers for image serving
    res.setHeader('Content-Type', user.avatarMimeType || 'image/jpeg');
    res.setHeader('Content-Length', user.avatarSizeBytes || user.avatarData.length);
    
    // Set cache headers for better performance
    if (user.avatarUploadedAt) {
      res.setHeader('Last-Modified', user.avatarUploadedAt.toUTCString());
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    }

    // Send the BLOB data
    return res.send(user.avatarData);
  }
}