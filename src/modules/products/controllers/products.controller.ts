import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { createResponse } from '../../../common/utilities';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('create')
  async create(@Body() createProductDto: CreateProductDto) {
    const productId = await this.productsService.create(createProductDto);
    return createResponse({ body: productId, statusCode: HttpStatus.CREATED });
  }

  @Get('list')
  async findAll() {
    const res = await this.productsService.findAll();
    return createResponse({ body: res, statusCode: HttpStatus.OK });
  }

  @Get('get/:id')
  async findOne(@Param('id') id: string) {
    const res = await this.productsService.findOne(id);
    return createResponse({ body: res, statusCode: HttpStatus.OK });
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const productId = this.productsService.update(id, updateProductDto);
    return createResponse({ body: productId, statusCode: HttpStatus.CREATED });
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return createResponse({ body: undefined, statusCode: HttpStatus.OK });
  }
}
