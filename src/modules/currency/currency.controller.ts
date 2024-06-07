import { Body, Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { firstValueFrom } from 'rxjs';
import { FindCurrencyPayloadDto } from './dto/findCurrencyPayloadDto.dto';


@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }

  @Get("/calculate")
  @UseGuards(JwtAuthGuard)
  async currentCurrencyStatus(@Body() payload: FindCurrencyPayloadDto) {
    try {
      const { from, to, amount } = payload
      const response = await firstValueFrom(this.currencyService.convertCurrencyFromTo(from, to, amount))
      return response.data
    } catch (error) {
      console.error('Error fetching currencies:', error)
      throw error
    }
  }

  @Get("/historical")
  @UseGuards(JwtAuthGuard)
  async historicalCurrencyStatus(@Body() payload: FindCurrencyPayloadDto) {
    try {
      const { from, to, startDate, endDate, amount } = payload
      const response = await firstValueFrom(this.currencyService.getAllHistoricalCurrencyFromTo(from, to, startDate, endDate))
      return response.data
    } catch (error) {
      console.error('Error fetching currencies:', error)
      throw error
    }
  }

}
