import { Injectable, RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';
import { CancelPaymentDto, ConfirmPaymentDto, CreateCheckoutSessionDto, CreatePaymentDto } from '../dto';

@Injectable()
export class PaymentsService {
  private stripe
  private webhookSecret

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
    this.webhookSecret = process.env.STRIPE_WH_KEY
  }

  async createCheckout(createCheckoutSessionDto: CreateCheckoutSessionDto) {
    try {
      const stripeResult = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: createCheckoutSessionDto.currency,
              product_data: {
                name: createCheckoutSessionDto.productName,
              },
              unit_amount: createCheckoutSessionDto.unitAmount * 100,
            },
            quantity: createCheckoutSessionDto.quantity,
          },
        ],
        mode: 'payment',
        success_url: createCheckoutSessionDto.successUrl,
        cancel_url: createCheckoutSessionDto.cancelUrl,
      });

      console.log(stripeResult);
    } catch (error) {
      console.log(error);
    }
    return;
  }

  async retriveCheckoutLineItems(checkoutSesionId: string) {
    try {
      const lineItemsList = await this.stripe.checkout.sessions.listLineItems(
        checkoutSesionId
      );
      console.log(lineItemsList);
    } catch (error) {
      console.log(error);
    }
    return
  }

  async handlePaymentWebhook(req: any) {

    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = await this.stripe.webhooks.constructEvent(req.rawBody, sig, this.webhookSecret);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const checkoutId = event.data.object.id
      const lineItemsList = await this.retriveCheckoutLineItems(checkoutId);
      console.log(lineItemsList);
    }
  }


  cancel(cancelPayment: CancelPaymentDto) {
    return this.stripe.paymentIntents.cancel(cancelPayment.paymentIntentId);
  }

}
