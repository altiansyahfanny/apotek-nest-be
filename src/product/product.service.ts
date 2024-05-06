import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}

  async findAll() {
    const data = await this.prismaService.product.findMany();

    return {
      data,
    };
  }

  // MUTATION
  create(createProductDto: Prisma.ProductCreateInput) {
    return this.prismaService.product.create({
      data: createProductDto,
    });
  }
}
