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
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserService } from './user.service';
import { RoleGuard } from 'src/role/role.guard';

export type UserQueryType = {
  name?: string;
  email?: string;
};

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
