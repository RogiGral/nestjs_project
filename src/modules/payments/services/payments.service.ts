import { Injectable, RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from '../dto';
import {
  InvoicesService,
  MailerService,
} from '../../../modules/invoices/services';
import { CompanyDto, ConsumerDto, CreateInvoiceDto, LineItemsDto } from '../../../modules/invoices/dto';
import { UsersService } from '../../../modules/users';

@Injectable()
export class PaymentsService {
  private stripe;
  private webhookSecret;

  constructor(
    private readonly invoiceService: InvoicesService,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: '2024-06-20',
    });
    this.webhookSecret = process.env.STRIPE_WH_KEY;
  }

  async createCheckout(createCheckoutSessionDto: CreateCheckoutSessionDto) {
    try {
      const stripeResult = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: createCheckoutSessionDto.priceList.map((item: any) => (
          {
            price: item.priceId,
            quantity: item.quantity,
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
              maximum: 10,
            },
          }
        )),
        billing_address_collection: 'required',
        mode: 'payment',
        tax_id_collection: {
          enabled: true,
        },
        success_url: createCheckoutSessionDto.successUrl,
        cancel_url: createCheckoutSessionDto.cancelUrl,
      });
      return stripeResult;
    } catch (error) {
      console.log(error);
    }
  }

  async retriveCheckoutLineItems(checkoutSesionId: string) {
    try {
      const lineItemsList =
        await this.stripe.checkout.sessions.listLineItems(checkoutSesionId);
      return lineItemsList;
    } catch (error) {
      console.log(error);
    }
    return;
  }

  async handlePaymentWebhook(req: any) {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
      event = await this.stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        this.webhookSecret,
      );
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const checkoutId = event.data.object.id;
      const lineItemsList = await this.retriveCheckoutLineItems(checkoutId);
      const createInvoice = this.mapToInvoiceDto(event.data.object.customer_details, lineItemsList);
      const invoiceId = await this.invoiceService.create(createInvoice);
      const pdfBuffer = await this.invoiceService.generatePDF(invoiceId);
      await this.mailerService.sendMail(
        event.data.object.customer_details.email,
        'Your Invoice',
        'Please find attached your invoice.',
        [
          {
            filename: `invoice_${invoiceId.id}.pdf`,
            content: pdfBuffer,
          },
        ],
      );
    }
  }

  mapToInvoiceDto(customerDetails: any, lineItemsList: any): CreateInvoiceDto {
    const { address, email, name, phone, tax_ids } = customerDetails;

    console.log(tax_ids)

    const consumer: ConsumerDto = {
      email,
      address: {
        city: address.city,
        country: address.country,
        line1: address.line1,
        line2: address.line2,
        postal_code: address.postal_code,
        state: address.state,
      },
      name,
      phoneNumber: phone,
    };

    const tax_value = tax_ids.length ? '0%' : '20%';
    const company: CompanyDto = tax_ids.length ? {
      name: name,
      tin_number: tax_ids[0].value,
    } : {
      name: '',
      tin_number: '',
    };

    const lineItems: LineItemsDto[] = lineItemsList.data.map((item: any) => ({
      name: item.description,
      amount_total: (item.price.unit_amount + (item.price.unit_amount * parseFloat(tax_value) / 100)) * item.quantity,
      amount_unit: item.price.unit_amount,
      quantity: item.quantity,
      currency: item.currency,
      tax_value: tax_value
    }));

    const createInvoice: CreateInvoiceDto = {
      date: new Date().toISOString(),
      userId: 'default_user_id',
      consumer: consumer,
      company: company,
      lineItems: lineItems,
    };

    return createInvoice
  };

}
