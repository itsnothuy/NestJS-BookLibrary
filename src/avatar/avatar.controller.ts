import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('avatar')
export class AvatarController {
  @Get(':filename')
  async getAvatar(@Param('filename') filename: string, @Res() res: Response) {
    const path = join(process.cwd(), 'uploads', 'avatars', filename);
    if (existsSync(path)) {
      return res.sendFile(path);
    } else {
      return res.status(404).json({ message: 'Avatar not found' });
    }
  }
}