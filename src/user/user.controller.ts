import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { RoleGuard } from 'src/guard/role.guard';
import { UserService } from './user.service';

export type UserQueryType = {
  name?: string;
  email?: string;
};

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
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

  @Get('/get/profile')
  async profile(@Req() req: Request) {
    const email = req.headers['user'];

    if (email) {
      return await this.prismaService.user.findUnique({ where: { email } });
    } else {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
