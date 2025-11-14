import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { UsersRepo } from '../users.repo';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly usersRepo: UsersRepo) {}

  @Get(':uuid')
  async getAvatar(@Param('uuid') uuid: string, @Res() res: Response) {
    const user = await this.usersRepo.findByUuid(uuid);

    if (!user || !user.avatarFilename) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const avatarPath = path.join('./uploads/avatars', user.avatarFilename);
    const absolutePath = path.resolve(avatarPath);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Avatar file not found on server' });
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    return res.sendFile(absolutePath);
  }
}