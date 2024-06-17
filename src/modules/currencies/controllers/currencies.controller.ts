import { Controller, Get, UseGuards, Body, Req } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CurrencyService } from '../services';
import { ClaimsGuard, JwtAuthGuard } from '../../../common/guards';
import { Claims } from '../../../common/decorators';
import { Claims as RequiredClaims } from '../../../common/consts/claims';
@Controller('currency')
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService
  ) { }

  @Get('/calculate')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_CALCULATE)
  async currentCurrencyStatus(@Req() request: any) {
    try {
      const { from, to, amount } = request.body;
      const response = await firstValueFrom(
        this.currencyService.convertCurrencyFromTo(from, to, amount),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  @Get('/historical')
  @UseGuards(JwtAuthGuard, ClaimsGuard)
  @Claims(RequiredClaims.CAN_ACCESS_HISTORICAL)
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
