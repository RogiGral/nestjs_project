import { Injectable } from '@nestjs/common';
import { CreatePriceDto, UpdatePriceDto } from '../dto';
import Stripe from 'stripe';

@Injectable()
export class PricesService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
  }

  async create(createPriceDto: CreatePriceDto) {
    createPriceDto.unit_amount = createPriceDto.unit_amount * 100;
    const price = await this.stripe.prices.create(createPriceDto);
    return { priceId: price.id };
  }

  async findAll() {
    const priceList = await this.stripe.prices.list();
    return priceList;
  }

  findOne(id: number) {
    return `This action returns a #${id} price`;
  }

  update(id: number, updatePriceDto: UpdatePriceDto) {
    return `This action updates a #${id} price`;
  }

  remove(id: number) {
    return `This action removes a #${id} price`;
  }
}
