import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './controllers';
import { PaymentMethodsService } from './services';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEntity, UserSchema, InvoiceEntity, InvoiceSchema, Counter, CounterSchema, MessageEntity, MessageSchema } from '../../entitities';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: MessageEntity.name, schema: MessageSchema },
      { name: InvoiceEntity.name, schema: InvoiceSchema },
      { name: Counter.name, schema: CounterSchema }
    ]),
  ],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, JwtService, UsersService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule { }
