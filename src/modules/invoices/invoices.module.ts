import { Module } from '@nestjs/common';
import { InvoicesController } from './controllers';
import { InvoicesService, MailerService } from './services';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Counter,
  CounterSchema,
  InvoiceEntity,
  InvoiceSchema,
  UserEntity,
  UserSchema,
} from '../../entitities';
import { UsersService } from '../users';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: InvoiceEntity.name, schema: InvoiceSchema },
    ]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, MailerService, UsersService, JwtService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
