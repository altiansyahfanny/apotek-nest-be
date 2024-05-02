import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const data = await this.databaseService.product.findMany();

    return {
      data,
    };
  }

  // MUTATION
  create(createProductDto: Prisma.ProductCreateInput) {
    return this.databaseService.product.create({
      data: createProductDto,
    });
  }
}
