import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentMethodsService } from '../services';
import { ChangePaymentMethodDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';


@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

  @Post('create/:userId')
  attach(@Param('userId') userId: string, @Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.attach(userId, createPaymentMethodDto);
  }
  @Post('change-customer/:userId')
  changeCustomerDefaultPaymentMethod(@Param('userId') userId: string, @Body() changePaymentMethodDto: ChangePaymentMethodDto) {
    return this.paymentMethodsService.changeCustomerDefaultPaymentMethod(userId, changePaymentMethodDto);
  }
  @Post('change-subscription/:userId/:subscriptionId')
  changeSubscriptionDefaultPaymentMethod(@Param('userId') userId: string, @Param('subscriptionId') subscriptionId: string, @Body() changePaymentMethodDto: ChangePaymentMethodDto) {
    return this.paymentMethodsService.changeSubscriptionPaymentMethod(userId, subscriptionId, changePaymentMethodDto);
  }

  @Get('findAll/:userId')
  findAll(@Param('userId') userId: string) {
    return this.paymentMethodsService.findAll(userId);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(+id);
  }
}
