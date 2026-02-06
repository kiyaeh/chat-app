import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Inject } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';

@Controller('files')
export class FileController {
  constructor(
    @Inject('FILE_SERVICE') private fileService: ClientProxy,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file provided');
    }

    return this.fileService.send('file.upload', {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }
}