import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './controllers';
import { PaymentMethodsService } from './services';
import { JwtService } from '@nestjs/jwt';


@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService, JwtService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule { }
