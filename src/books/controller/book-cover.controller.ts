import { Controller, Get, Param, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('uploads/book-covers')
export class BookCoverController {
  @Get(':filename')
  async serveCover(@Param('filename') filename: string, @Res() res: Response) {
    // Security: Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename');
    }

    // Security: Only allow specific file extensions
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException('Invalid file type');
    }

    const coverPath = path.join(process.cwd(), 'uploads', 'book-covers', filename);

    // Check if file exists
    if (!fs.existsSync(coverPath)) {
      throw new NotFoundException('Cover file not found');
    }

    // Verify the resolved path is still within the uploads directory (prevent traversal)
    const resolvedPath = path.resolve(coverPath);
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'book-covers');
    if (!resolvedPath.startsWith(uploadsDir)) {
      throw new BadRequestException('Invalid file path');
    }

    return res.sendFile(resolvedPath);
  }
}
