import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers,
  RawBodyRequest,
  Param,
} from '@nestjs/common';
import { CreateCheckoutSessionDto } from '../dto';
import { PaymentsService } from '../services';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private jwtService: JwtService,) { }

  @Post('checkout/create')
  async createCheckoutSession(
    @Req() req: Request,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
    @Res() res: Response,
  ) {
    const decoded = this.jwtService.decode(req.headers.authorization?.split(' ')[1]) as any;
    const data = await this.paymentsService.createCheckout(
      createCheckoutSessionDto, decoded?._doc.customer
    );
    res.status(200).send({ data });
  }

  @Post('checkout/lineitems/:checkoutId')
  async retriveCheckoutSessionLineItems(
    @Param('checkoutId') checkoutId: string,
    @Res() res: Response,
  ) {
    await this.paymentsService.retriveCheckoutLineItems(checkoutId);
    res.status(200).send();
  }

  @Post('subscription/cancel/:subscriptionId')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Res() res: Response,
  ) {
    await this.paymentsService.cancelSubscription(subscriptionId);
    res.status(200).send();
  }

  @Post('webhook')
  async paymentWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    await this.paymentsService.handlePaymentWebhook(req);
    res.status(200).send();
  }
}

/*

chemy mięc nip i nazwe firmy 
jeśli ktoś wpisze naze firmy i nip to traktujemy go jako firma 
firma to zerowy vat a jak nie to 20% vat

numery nip mają być validowane 

chcemy aby klient przy płątności mógł podać billing addres ulica nr domu kod pocztowy miasto kraj 

*/
