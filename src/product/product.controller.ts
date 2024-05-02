import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { Prisma } from '@prisma/client';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Query() q: object) {
    return this.productService.findAll();
  }

  @Post()
  create(@Body() createProductDto: Prisma.ProductCreateInput) {
    return this.productService.create(createProductDto);
  }
}
