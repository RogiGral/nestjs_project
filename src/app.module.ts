import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth';
import { CurrencyModule } from './modules/currencies';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users';
import { InvoicesModule } from './modules/invoices';
import { PaymentsModule } from './modules/payments';
import { ProductsModule } from './modules/products';


@Module({
  providers: [AppService],
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
  ],
})
export class AppModule { }
