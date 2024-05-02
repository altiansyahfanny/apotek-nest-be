import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  create(createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({
      data: createUserDto,
    });
  }

  async findAll(
    query: Prisma.UserWhereInput,
    pagination: { page: number; pageSize: number },
    sort: { direction: string; column: string },
  ) {
    const total = await this.databaseService.user.count({
      where: query,
    });
    const data = await this.databaseService.user.findMany({
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
    return this.databaseService.user.findFirst({ where: { id } });
  }

  update(id: number, updateUserDto: Prisma.UserCreateInput) {
    // return `This action updates a #${id} user : ${updateUserDto}`;
    return this.databaseService.user.update({
      data: updateUserDto,
      where: { id },
    });
  }

  remove(id: number) {
    return this.databaseService.user.delete({ where: { id } });
  }
}
