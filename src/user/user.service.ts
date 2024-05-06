import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  create(createUserDto: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data: createUserDto,
    });
  }

  async findAll(
    query: Prisma.UserWhereInput,
    pagination: { page: number; pageSize: number },
    sort: { direction: string; column: string },
  ) {
    const total = await this.prismaService.user.count({
      where: query,
    });
    const data = await this.prismaService.user.findMany({
      where: query,
      take: pagination.pageSize,
      skip: (pagination.page - 1) * pagination.pageSize,
      orderBy: { [sort.column]: sort.direction },
    });

    return {
      meta: {
        total,
        pageSize: pagination.pageSize,
        page: pagination.page,
        sort,
      },
      data: data,
    };
  }

  findOne(id: number) {
    return this.prismaService.user.findFirst({ where: { id } });
  }

  update(id: number, updateUserDto: Prisma.UserCreateInput) {
    // return `This action updates a #${id} user : ${updateUserDto}`;
    return this.prismaService.user.update({
      data: updateUserDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.prismaService.user.delete({ where: { id } });
  }
}
