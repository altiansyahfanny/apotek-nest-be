import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductService } from './product.service';

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
