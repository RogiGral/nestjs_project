import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrencyService } from './services/currencies.service';
import { CurrencyController } from './controllers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import {
  InvoiceEntity,
  InvoiceSchema,
  MessageEntity,
  MessageSchema,
  UserEntity,
  UserSchema,
} from '../../entitities';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: MessageEntity.name, schema: MessageSchema },
      { name: InvoiceEntity.name, schema: InvoiceSchema }
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, JwtService, UsersService],
  exports: [CurrencyService],
})
export class CurrencyModule { }
