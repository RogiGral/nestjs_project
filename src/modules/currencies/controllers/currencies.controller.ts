import { Controller, Get, UseGuards, Body } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CurrencyService } from '../services';
import { JwtAuthGuard } from '../../../common/guards';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Get('/calculate')
  @UseGuards(JwtAuthGuard)
  async currentCurrencyStatus(@Body() payload: any) {
    try {
      const { from, to, amount } = payload;
      const response = await firstValueFrom(
        this.currencyService.convertCurrencyFromTo(from, to, amount),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  @Get('/historical')
  @UseGuards(JwtAuthGuard)
  async historicalCurrencyStatus(@Body() payload: any) {
    try {
      const { from, to, startDate, endDate } = payload;
      const response = await firstValueFrom(
        this.currencyService.getAllHistoricalCurrenciesFromTo(
          from,
          to,
          startDate,
          endDate,
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
