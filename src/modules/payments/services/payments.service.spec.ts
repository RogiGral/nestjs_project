import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import {
  InvoicesService,
  MailerService,
} from '../../../modules/invoices/services';
import { CreateInvoiceDto } from '../../../modules/invoices/dto';
import { UsersService } from '../../../modules/users';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let invoicesService: InvoicesService;
  let mailerService: MailerService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        InvoicesService,
        MailerService,
        UsersService,
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    invoicesService = module.get<InvoicesService>(InvoicesService);
    mailerService = module.get<MailerService>(MailerService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createCheckout', () => {
    it('should create a checkout session', async () => {
      // Arrange
      const createCheckoutSessionDto = {
        priceId: 'price_123',
        quantity: 2,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const stripeResult = {
        // mock the expected response from Stripe
      };

      jest
        .spyOn(service['stripe'].checkout.sessions, 'create')
        .mockResolvedValue(stripeResult);

      // Act
      const result = await service.createCheckout(createCheckoutSessionDto);

      // Assert
      expect(service['stripe'].checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price: createCheckoutSessionDto.priceId,
            quantity: createCheckoutSessionDto.quantity,
          },
        ],
        mode: 'payment',
        success_url: createCheckoutSessionDto.successUrl,
        cancel_url: createCheckoutSessionDto.cancelUrl,
      });
      expect(result).toEqual(stripeResult);
    });

    it('should log an error if an exception occurs', async () => {
      // Arrange
      const createCheckoutSessionDto = {
        priceId: 'price_123',
        quantity: 2,
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };

      const error = new Error('Something went wrong');
      jest
        .spyOn(service['stripe'].checkout.sessions, 'create')
        .mockRejectedValue(error);
      jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.createCheckout(createCheckoutSessionDto);

      // Assert
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('retriveCheckoutLineItems', () => {
    it('should retrieve the line items for a checkout session', async () => {
      // Arrange
      const checkoutSessionId = 'session_123';

      const lineItemsList = {
        // mock the expected response from Stripe
      };

      jest
        .spyOn(service['stripe'].checkout.sessions, 'listLineItems')
        .mockResolvedValue(lineItemsList);

      // Act
      const result = await service.retriveCheckoutLineItems(checkoutSessionId);

      // Assert
      expect(
        service['stripe'].checkout.sessions.listLineItems,
      ).toHaveBeenCalledWith(checkoutSessionId);
      expect(result).toEqual(lineItemsList);
    });

    it('should log an error if an exception occurs', async () => {
      // Arrange
      const checkoutSessionId = 'session_123';

      const error = new Error('Something went wrong');
      jest
        .spyOn(service['stripe'].checkout.sessions, 'listLineItems')
        .mockRejectedValue(error);
      jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.retriveCheckoutLineItems(checkoutSessionId);

      // Assert
      expect(console.log).toHaveBeenCalledWith(error);
    });
  });

  describe('handlePaymentWebhook', () => {
    it('should handle the payment webhook', async () => {
      // Arrange
      const req = {
        headers: {
          'stripe-signature': 'signature_123',
        },
        rawBody: 'raw_body',
      };

      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'session_123',
            customer_details: {
              email: 'test@example.com',
            },
          },
        },
      };

      const lineItemsList = {
        data: [
          {
            amount_total: 100,
            description: 'Product 1',
          },
        ],
      };

      const createInvoiceDto: CreateInvoiceDto = {
        userId: '666ac614f09126b9126bdd92',
        amount: lineItemsList.data[0].amount_total,
        date: expect.any(Date),
        description: lineItemsList.data[0].description,
      };

      const invoiceId = 'invoice_123';
      const pdfBuffer = Buffer.from('pdf_content');
      const mailerResponse = {
        // mock the expected response from the mailer service
      };

      jest
        .spyOn(service, 'retriveCheckoutLineItems')
        .mockResolvedValue(lineItemsList);
      jest
        .spyOn(service['invoiceService'], 'generatePDF')
        .mockResolvedValue(pdfBuffer);
      jest
        .spyOn(service['mailerService'], 'sendMail')
        .mockResolvedValue(mailerResponse);
      jest.spyOn(console, 'log').mockImplementation();

      jest
        .spyOn(service['stripe'].webhooks, 'constructEvent')
        .mockResolvedValue(event);

      // Act
      await service.handlePaymentWebhook(req);

      // Assert
      expect(service['stripe'].webhooks.constructEvent).toHaveBeenCalledWith(
        req.rawBody,
        req.headers['stripe-signature'],
        service['webhookSecret'],
      );
      expect(service.retriveCheckoutLineItems).toHaveBeenCalledWith(
        event.data.object.id,
      );
      expect(service['invoiceService'].create).toHaveBeenCalledWith(
        createInvoiceDto,
      );
      expect(service['invoiceService'].generatePDF).toHaveBeenCalledWith(
        invoiceId,
      );
      expect(service['mailerService'].sendMail).toHaveBeenCalledWith(
        event.data.object.customer_details.email,
        'Your Invoice',
        'Please find attached your invoice.',
        [
          {
            filename: `invoice_${invoiceId}.pdf`,
            content: pdfBuffer,
          },
        ],
      );
    });

    it('should log an error if an exception occurs during webhook handling', async () => {
      // Arrange
      const req = {
        headers: {
          'stripe-signature': 'signature_123',
        },
        rawBody: 'raw_body',
      };

      const error = new Error('Something went wrong');
      jest
        .spyOn(service['stripe'].webhooks, 'constructEvent')
        .mockRejectedValue(error);
      jest.spyOn(console, 'log').mockImplementation();

      // Act
      await service.handlePaymentWebhook(req);

      // Assert
      expect(console.log).toHaveBeenCalledWith(
        `Webhook Error: ${error.message}`,
      );
    });
  });
});
