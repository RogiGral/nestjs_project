import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import Stripe from 'stripe';

@Injectable()
export class ProductsService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async create(createProductDto: CreateProductDto) {
    const product = await this.stripe.products.create(createProductDto);
    return product.id;
  }

  async findAll() {
    const products = await this.stripe.products.list();
    return products;
  }

  async findOne(id: string) {
    const product = await this.stripe.products.retrieve(id);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.stripe.products.update(id, updateProductDto);
    return product.id;
  }

  async remove(id: string) {
    await this.stripe.products.del(id);
    return `Deleted #${id} product`;
  }
}
