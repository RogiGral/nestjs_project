import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PaymentsService } from './services';
import { PaymentsController } from './controllers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Counter,
  CounterSchema,
  InvoiceEntity,
  InvoiceSchema,
  MessageEntity,
  MessageSchema,
  UserEntity,
  UserSchema,
} from '../../entitities';
import { RawBodyMiddleware } from '../../common/middlewares/rawBodyMiddleware';
import { InvoicesService, MailerService } from '../invoices/services';
import { EventsService } from '../events';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: MessageEntity.name, schema: MessageSchema },
      { name: InvoiceEntity.name, schema: InvoiceSchema },
      { name: Counter.name, schema: CounterSchema }
    ]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InvoicesService,
    MailerService,
    UsersService,
    JwtService,
    EventsService
  ],
  exports: [PaymentsService],
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'payments/webhook', method: RequestMethod.POST });
  }
}
