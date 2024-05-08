import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { RoleGuard } from 'src/guard/role.guard';
import { UserService } from './user.service';

import { Response as ResponseExpress } from 'express';
import { multerConfig } from 'src/config/multer.config';
import { FileService } from 'src/file/file.service';

export type UserQueryType = {
  name?: string;
  email?: string;
};

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize = 10,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection: string = 'asc',
    @Query('sortColumn', new DefaultValuePipe('id'))
    sortColumn: string = 'id',
  ) {
    const prismaQuery: Prisma.UserWhereInput = {
      name: { contains: name },
      email: { contains: email },
    };

    const pagination = {
      page,
      pageSize,
    };

    return this.userService.findAll(prismaQuery, pagination, {
      direction: sortDirection,
      column: sortColumn,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserCreateInput,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(new RoleGuard(['Admin']))
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('/:id/update-profile-picture')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updatePic(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    console.log('File uploaded : ', file);
    console.log('id : ', id);

    const user = await this.prismaService.user.update({
      where: { id: +id },
      data: { profilePic: `/upload/${file.filename}` },
    });

    return {
      message: 'File uploaded successfully',
      data: user,
    };
  }
  @Get('picture/:fileName')
  async getFile(
    @Param('fileName') fileName: string,
    @Res() res: ResponseExpress,
  ) {
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
