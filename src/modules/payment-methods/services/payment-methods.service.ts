import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChangePaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';
import Stripe from 'stripe';
import { UsersService } from '../../../modules/users';

@Injectable()
export class PaymentMethodsService {

  constructor(@Inject('STRIPE') private readonly stripe: Stripe, private readonly userService: UsersService) { }

  async attach(userId: string, attachPaymentMethodDto: any) {

    const user = (await this.userService.findOne(userId)).findUser;

    if (!user) {
      throw new NotFoundException(
        `User with id '${userId}' not found!`,
      );
    }

    try {
      const result = await this.stripe.paymentMethods.attach(attachPaymentMethodDto.type, {
        customer: user.customer.id,
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async changeCustomerDefaultPaymentMethod(userId: string, changePaymentMethodDto: any) {

    const user = (await this.userService.findOne(userId)).findUser;

    if (!user) {
      throw new NotFoundException(
        `User with id '${userId}' not found!`,
      );
    }

    try {

      const user = (await this.userService.findOne(userId)).findUser;

      if (!user) {
        throw new NotFoundException(
          `User with id '${userId}' not found!`,
        );
      }

      const retrivePaymentMethod = await this.stripe.paymentMethods.retrieve(
        changePaymentMethodDto.payment_method_id
      );

      if (!retrivePaymentMethod) {
        throw new NotFoundException(
          `Payment method with id '${retrivePaymentMethod}' not found!`,
        );
      }

      const customerPaymentMethods = await this.stripe.customers.listPaymentMethods(
        user.customer.id
      );

      const paymentMethodIds = customerPaymentMethods.data.map((paymentMethod) => paymentMethod.id);

      if (!paymentMethodIds.includes(changePaymentMethodDto.payment_method_id)) {
        throw new NotFoundException(
          `Payment method with id '${changePaymentMethodDto.payment_method_id}' is not connected to the customer!`,
        );
      }

      const result = await this.stripe.customers.update(user.customer.id, {
        invoice_settings: {
          default_payment_method: changePaymentMethodDto.payment_method_id,
        },
      });
      return result;

    } catch (error) {
      return {
        message: error.message,
        status: error.status

      };
    }
  }

  async changeSubscriptionPaymentMethod(userId: string, subscriptionId: string, changePaymentMethodDto: ChangePaymentMethodDto) {
    try {
      const user = (await this.userService.findOne(userId)).findUser;

      if (!user) {
        throw new NotFoundException(
          `User with id '${userId}' not found!`,
        );
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );

      if (!subscription) {
        throw new NotFoundException(
          `Subscription with id '${subscription}' not found!`,
        );
      }

      const retrivePaymentMethod = await this.stripe.paymentMethods.retrieve(
        changePaymentMethodDto.payment_method_id
      );

      if (!retrivePaymentMethod) {
        throw new NotFoundException(
          `Payment method with id '${retrivePaymentMethod}' not found!`,
        );
      }

      const customerPaymentMethods = await this.stripe.customers.listPaymentMethods(
        user.customer.id
      );

      const paymentMethodIds = customerPaymentMethods.data.map((paymentMethod) => paymentMethod.id);

      if (!paymentMethodIds.includes(changePaymentMethodDto.payment_method_id)) {
        throw new NotFoundException(
          `Payment method with id '${changePaymentMethodDto.payment_method_id}' is not connected to the customer!`,
        );
      }

      const paymentMethod = await this.stripe.paymentMethods.attach(changePaymentMethodDto.payment_method_id, {
        customer: user.customer.id,
      });

      const result = await this.stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethod.id,
      });

      return result

    } catch (error) {
      return {
        message: error.message,
        status: error.status

      };
    }

  }

  async findAll(userId: string) {
    const user = (await this.userService.findOne(userId)).findUser;

    if (!user) {
      throw new NotFoundException(
        `User with id '${userId}' not found!`,
      );
    }

    try {
      const paymentMethods = await this.stripe.customers.listPaymentMethods(user.customer.id);
      return paymentMethods;
    } catch (error) {
      throw new Error(error.message);
    }
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
