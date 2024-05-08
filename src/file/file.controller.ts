import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response as ResponseExpress } from 'express';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('/:fileName')
  async get(@Param('fileName') fileName: string, @Res() res: ResponseExpress) {
    try {
      const fileBuffer = await this.fileService.readFile(
        `./uploads/${fileName}`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(fileBuffer);
    } catch (error) {
      res.status(404).send('File not found');
    }
  }
}
