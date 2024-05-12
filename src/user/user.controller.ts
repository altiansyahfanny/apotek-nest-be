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
import { SearchUserRequest, UserResponse } from 'src/model/user.model';
import { WebResponse } from 'src/model/web.model';

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

  @Get()
  findAll(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('role') role: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
    @Query('sortDirection', new DefaultValuePipe('desc'))
    sortDirection?: string,
    @Query('sortColumn', new DefaultValuePipe('id'))
    sortColumn?: string,
  ): Promise<WebResponse<UserResponse[]>> {
    const request: SearchUserRequest = {
      name,
      email,
      role,
      page: page || 1,
      size: size || 10,
      sortColumn,
      sortDirection,
    };

    return this.userService.findAll(request);
  }
}
