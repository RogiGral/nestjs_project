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
  UserEntity,
  UserSchema,
} from '../../entitities';
import { RawBodyMiddleware } from '../../common/middlewares/rawBodyMiddleware';
import { InvoicesService, MailerService } from '../invoices/services';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: InvoiceEntity.name, schema: InvoiceSchema },
    ]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    InvoicesService,
    MailerService,
    UsersService,
    JwtService,
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
