import { Controller, Get, UseGuards, Body } from "@nestjs/common"
import { firstValueFrom } from "rxjs"
import { JwtAuthGuard } from "src/common/guards"
import { CurrencyService } from "./currencies.service"
import { FindCurrencyPayloadDto } from "./dto"

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
      const { from, to, startDate, endDate } = payload
      const response = await firstValueFrom(this.currencyService.getAllHistoricalCurrenciesFromTo(from, to, startDate, endDate))
      return response.data
    } catch (error) {
      console.error('Error fetching currencies:', error)
      throw error
    }
  }

}
