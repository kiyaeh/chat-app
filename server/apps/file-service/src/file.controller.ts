import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { FileService } from './file.service';

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @MessagePattern('file.upload')
  async uploadFile(data: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    return this.fileService.uploadFile(data);
  }

  @MessagePattern('file.delete')
  async deleteFile(data: { fileUrl: string }) {
    return this.fileService.deleteFile(data.fileUrl);
  }

  @MessagePattern('file.get')
  async getFile(data: { fileUrl: string }) {
    return this.fileService.getFile(data.fileUrl);
  }
}