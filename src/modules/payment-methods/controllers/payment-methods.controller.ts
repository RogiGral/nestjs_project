import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentMethodsService } from '../services';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../dto';


@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) { }

  @Post('create/:userId')
  attach(@Param('userId') userId: string, @Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    console.log(createPaymentMethodDto);
    return this.paymentMethodsService.attach(userId);
  }

  @Get()
  findAll() {
    return this.paymentMethodsService.findAll();
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
