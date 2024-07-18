import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  async create(@Body() createProductDto: CreateProductDto) {
    const productId = await this.productsService.create(createProductDto);
    return { productId };
  }

  @Get('list')
  async findAll() {
    const res = await this.productsService.findAll();
    return res;
  }

  @Get('get/:id')
  async findOne(@Param('id') id: string) {
    const res = await this.productsService.findOne(id);
    return res;
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const productId = this.productsService.update(id, updateProductDto);
    return { productId };
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
