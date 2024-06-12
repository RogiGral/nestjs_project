import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CurrencyService } from './services/currencies.service';
import { CurrencyController } from './controllers';

@Module({
  imports: [HttpModule],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule {}
