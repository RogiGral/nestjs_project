import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from '../dto';
import {
  InvoicesService,
  MailerService,
} from '../../../modules/invoices/services';
import { CompanyDto, ConsumerDto, CreateInvoiceDto, LineItemsDto } from '../../../modules/invoices/dto';
import { CustomerDto } from '../../../modules/users/dto';
import { EventsService } from '../../events';

@Injectable()
export class PaymentsService {
  private webhookSecret;

  constructor(
    private readonly invoiceService: InvoicesService,
    private readonly mailerService: MailerService,
    private readonly eventsService: EventsService,
    @Inject('STRIPE') private readonly stripe: Stripe,
  ) {
    this.webhookSecret = process.env.STRIPE_WH_KEY;
  }

  async createCheckout(createCheckoutSessionDto: CreateCheckoutSessionDto, customer?: CustomerDto) {
    const isPaymentOrSubscription = await this.checkIfPaymentOrSubscription(createCheckoutSessionDto.priceList);
    const isGuest = customer ? false : true;
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
        payment_method_collection: isPaymentOrSubscription ? 'if_required' : 'always',
        billing_address_collection: isGuest ? 'required' : 'auto',
        mode: isPaymentOrSubscription ? 'subscription' : 'payment',
        customer: isGuest ? undefined : customer.id,
        tax_id_collection: {
          enabled: true,
        },
        customer_update: isGuest ? undefined : {
          name: 'auto',
        },
        success_url: createCheckoutSessionDto.successUrl,
        cancel_url: createCheckoutSessionDto.cancelUrl,
      });
      this.eventsService.createCheckoutEvent({
        msg: 'checkoutCreated',
        content: stripeResult,
      });
      return stripeResult;
    } catch (error) {
      console.log(error);
    }
  }

  cancelSubscription(subscriptionId: string) {
    try {
      const subscription = this.stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      console.log(error);
    }
  }

  async checkIfPaymentOrSubscription(priceList: any): Promise<boolean> {
    const results = await Promise.all(
      priceList.map(async (element) => {
        if (!element.priceId) {
          throw new Error('Price ID is required');
        }
        const price = await this.stripe.prices.retrieve(element.priceId);
        return price.type === 'recurring';
      })
    );
    return results.some(result => result);
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
      console.log({
        eventType: event.type,
        eventObject: event.data.object,
      })
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return;
    }
    if (event.type === 'invoice.paid') {

      console.log('Invoice was created');
      this.eventsService.invoicePaidEvent({
        msg: 'invoicePaid',
        content: event.data.object,
      });

      const customerInfo = await this.stripe.customers.retrieve(event.data.object.customer);
      const createInvoice = await this.mapToInvoiceDto(customerInfo, event.data.object.lines);

      const invoiceId = await this.invoiceService.create(createInvoice);
      this.eventsService.createInvoiceEvent({
        msg: 'invoiceCreated',
        content: invoiceId,
      });

      const pdfBuffer = await this.invoiceService.generatePDF(invoiceId);
      await this.mailerService.sendMail(
        createInvoice.consumer.email,
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
    if (event.type === 'checkout.session.completed' && event.data.object.mode === 'payment') {
      const checkoutId = event.data.object.id;
      const lineItemsList = await this.retriveCheckoutLineItems(checkoutId);
      const createInvoice = await this.mapToInvoiceDto(event.data.object.customer_details, lineItemsList);
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
    console.log('Invoice was created');
  }

  async mapToInvoiceDto(customerDetails: any, lineItemsList: any): Promise<CreateInvoiceDto> {
    const { address, email, name, phone } = customerDetails;
    let tax_ids = customerDetails.tax_ids;

    if (!tax_ids) {
      tax_ids = await this.stripe.customers.listTaxIds(customerDetails.id);
    }

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
    // to jest array idk którą wartość wziąc, może dodać blocker żeby mieć max 1 
    console.log(tax_ids.data[0].country);
    const tax_value = tax_ids.data.length ?
      tax_ids.data[0].country !== 'USA' ?
        tax_ids.data[0].country !== 'PL' ?
          tax_ids.data[0].country !== 'CZ' ?
            "20%" : "15%" : "10%" : "5%" : '20%';
    //usa 5%, pl 10%, cz 15%, rest 20%

    const company: CompanyDto = tax_ids.data.length ? {
      name: name,
      tin_number: tax_ids.data[0].value,
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
