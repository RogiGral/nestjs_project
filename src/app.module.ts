import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth';
import { CurrencyModule } from './modules/currencies';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  providers: [AppService],
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb://localhost/nest',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
      }),
    }),
    AuthModule,
    CurrencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    UsersModule,
    InvoicesModule,
  ],
})
export class AppModule { }
