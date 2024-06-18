import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrencyService } from './services/currencies.service';
import { CurrencyController } from './controllers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from '../../entitities';

@Module({
  imports: [HttpModule,
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: InvoiceEntity.name, schema: InvoiceSchema }]),

  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, JwtService, UsersService],
})
export class CurrencyModule { }
