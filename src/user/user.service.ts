import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { SearchUserRequest, UserResponse } from 'src/model/user.model';
import { WebResponse } from 'src/model/web.model';
import { UserValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  create(createUserDto: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data: createUserDto,
    });
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

  async findAll(
    request: SearchUserRequest,
  ): Promise<WebResponse<UserResponse[]>> {
    const searchRequest: SearchUserRequest = this.validationService.validate(
      UserValidation.SERACH,
      request,
    );

    const filters = [];

    if (searchRequest.name) {
      // add name filter
      filters.push({
        name: {
          contains: searchRequest.name,
        },
      });
    }

    if (searchRequest.email) {
      // add email filter
      filters.push({
        email: {
          contains: searchRequest.email,
        },
      });
    }

    if (searchRequest.role) {
      // add role filter
      filters.push({
        role: {
          contains: searchRequest.role,
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const users = await this.prismaService.user.findMany({
      where: {
        AND: filters,
      },
      take: searchRequest.size,
      skip,
      orderBy: { [searchRequest.sortColumn]: searchRequest.sortDirection },
    });

    const total = await this.prismaService.user.count({
      where: {
        AND: filters,
      },
    });

    return {
      data: users,
      paging: {
        page: searchRequest.page,
        pageSize: searchRequest.size,
        total,
        totalPage: Math.ceil(total / searchRequest.size),
        sortColumn: searchRequest.sortColumn,
        sortDirection: searchRequest.sortDirection,
      },
    };
  }
}
