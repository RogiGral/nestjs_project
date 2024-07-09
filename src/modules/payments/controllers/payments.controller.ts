import { Controller, Post, Body, Req, Res, Headers, RawBodyRequest, Param } from "@nestjs/common";
import { CreatePaymentDto, ConfirmPaymentDto, CreateCheckoutSessionDto } from "../dto";
import { PaymentsService } from "../services";
import { Request, Response } from 'express';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('checkout/create')
  async createCheckoutSession(@Body() createCheckoutSessionDto: CreateCheckoutSessionDto, @Res() res: Response) {
    await this.paymentsService.createCheckout(createCheckoutSessionDto);
    res.status(200).send();
  }

  @Post('checkout/lineitems/:checkoutId')
  async retriveCheckoutSessionLineItems(@Param('checkoutId') checkoutId: string, @Res() res: Response) {
    await this.paymentsService.retriveCheckoutLineItems(checkoutId);
    res.status(200).send();
  }

  @Post('webhook')
  async paymentWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    await this.paymentsService.handlePaymentWebhook(req);
    res.status(200).send();
  }


}
