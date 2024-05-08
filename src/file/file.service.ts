import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { unlink } from 'fs/promises';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}
  async readFile(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }

  async deletePreviousUserPicture(userId: number, file: Express.Multer.File) {
    const userPicture = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (userPicture.profilePic) {
      try {
        await unlink('uploads/' + userPicture.profilePic);
      } catch (error) {
        // delete file was uploaded
        await unlink('uploads/' + file.filename);
        throw new HttpException(
          'Failed to delete prev picture',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
