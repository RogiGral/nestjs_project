import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import Stripe from 'stripe';
import { UsersService } from '../../../modules/users';

@Injectable()
export class PaymentMethodsService {

  constructor(@Inject('STRIPE') private readonly stripe: Stripe, private readonly userService: UsersService) { }

  async attach(userId: string) {

    const user = (await this.userService.findOne(userId)).findUser;

    if (!user) {
      throw new NotFoundException(
        `User with id '${userId}' not found!`,
      );
    }

    try {
      const result = await this.stripe.paymentMethods.attach('pm_card_visa', {
        customer: user.customer.id,
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  findAll() {
    return `This action returns all paymentMethods`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentMethod`;
  }

  update(id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return `This action updates a #${id} paymentMethod`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentMethod`;
  }
}
