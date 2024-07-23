import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './controllers';
import { PaymentMethodsService } from './services';


@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
})
export class PaymentMethodsModule { }
