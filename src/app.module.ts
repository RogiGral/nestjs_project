import { Global, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth';
import { CurrencyModule } from './modules/currencies';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users';
import { InvoicesModule } from './modules/invoices';
import { PaymentsModule } from './modules/payments';
import { ProductsModule } from './modules/products';
import { PricesModule } from './modules/prices';
import { PaymentMethodsModule } from './modules/payment-methods';
import { ChatModule } from './modules/events/chatmodule';
import Stripe from 'stripe';


@Global()
@Module({
  providers: [
    AppService,
    {
      provide: 'STRIPE',
      useFactory: () => {
        return new Stripe(process.env.STRIPE_API_KEY, {
          apiVersion: '2024-06-20',
        });
      },
    },
  ],
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nestjs'),
    AuthModule,
    CurrencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    UsersModule,
    InvoicesModule,
    PaymentsModule,
    ProductsModule,
    PricesModule,
    PaymentMethodsModule,
    ChatModule,
  ],
  exports: ['STRIPE'],
})
export class AppModule { }
