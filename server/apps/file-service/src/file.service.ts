import { Injectable } from '@nestjs/common';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly uploadPath = './uploads';

  async uploadFile(data: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    const fileId = uuidv4();
    const extension = data.originalname.split('.').pop();
    const filename = `${fileId}.${extension}`;
    const filepath = join(this.uploadPath, filename);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new Error('File type not allowed');
    }

    // Validate file size (10MB max)
    if (data.size > 10 * 1024 * 1024) {
      throw new Error('File too large');
    }

    try {
      writeFileSync(filepath, data.buffer);
      
      return {
        fileUrl: `/uploads/${filename}`,
        fileName: data.originalname,
        fileSize: data.size,
        fileMimeType: data.mimetype,
      };
    } catch (error) {
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(fileUrl: string) {
    const filename = fileUrl.replace('/uploads/', '');
    const filepath = join(this.uploadPath, filename);

    try {
      if (existsSync(filepath)) {
        unlinkSync(filepath);
        return { success: true };
      }
      return { success: false, error: 'File not found' };
    } catch (error) {
      throw new Error('Failed to delete file');
    }
  }

  async getFile(fileUrl: string) {
    const filename = fileUrl.replace('/uploads/', '');
    const filepath = join(this.uploadPath, filename);

    try {
      if (existsSync(filepath)) {
        const buffer = readFileSync(filepath);
        return { buffer, exists: true };
      }
      return { exists: false };
    } catch (error) {
      throw new Error('Failed to read file');
    }
  }
}