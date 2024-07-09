import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PaymentsService } from './services';
import { PaymentsController } from './controllers';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceEntity, InvoiceSchema, UserEntity, UserSchema } from '../../entitities';
import { RawBodyMiddleware } from '../../common/middlewares/rawBodyMiddleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: InvoiceEntity.name, schema: InvoiceSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, UsersService, JwtService],
  exports: [PaymentsService]
})
export class PaymentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'payments/webhook', method: RequestMethod.POST });
  }
}
