import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class CurrencyService {
  constructor(private readonly httpService: HttpService) {}

  private readonly host: string = 'api.frankfurter.app';

  convertCurrencyFromTo(
    from: string,
    to: string,
    amount: number,
  ): Observable<AxiosResponse<any>> {
    const url = `https://${this.host}/latest?amount=${amount}&from=${from}&to=${to}`;
    return this.httpService.get(url);
  }
  getAllLatestCurrenciesFromTo(
    from: string,
    to: string,
  ): Observable<AxiosResponse<any>> {
    const url = `https://${this.host}/latest?from=${from}&to=${to}`;
    return this.httpService.get(url);
  }

  getAllHistoricalCurrenciesFromTo(
    from: string,
    to: string,
    startDate: string,
    endDate: string,
  ): Observable<AxiosResponse<any>> {
    const url = `https://${this.host}/${startDate}..${endDate}?from=${from}&to=${to}`;
    return this.httpService.get(url);
  }
}
