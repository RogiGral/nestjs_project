import { Module } from '@nestjs/common';
import { PricesService } from './services';
import { PricesController } from './controllers';

@Module({
  controllers: [PricesController],
  providers: [PricesService],
})
export class PricesModule { }
