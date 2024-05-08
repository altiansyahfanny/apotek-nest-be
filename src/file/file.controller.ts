import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response as ResponseExpress } from 'express';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { PrismaService } from 'src/common/prisma.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly prismaService: PrismaService,
  ) {}

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

  @Post('/:userId/update-user-profile-picture')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updateUserProfilePicture(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') id: string,
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const userId = +id;

    await this.fileService.deletePreviousUserPicture(userId, file);

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { profilePic: file.filename },
    });

    return {
      message: 'File uploaded successfully',
      data: user,
    };
  }
}
