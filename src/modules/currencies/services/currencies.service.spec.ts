import { Test, TestingModule } from '@nestjs/testing';
import { HttpService, HttpModule } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { CurrencyService } from './currencies.service';
import { CurrencyModule } from '../currencies.module';

describe('CurrencyService', () => {
    let service: CurrencyService;
    let httpService: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule, CurrencyModule],
            providers: [CurrencyService],
        }).compile();

        service = module.get<CurrencyService>(CurrencyService);
        httpService = module.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('convertCurrencyFromTo', () => {
        it('should call httpService.get with correct URL', async () => {
            const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({} as AxiosResponse));
            await service.convertCurrencyFromTo('USD', 'EUR', 100).toPromise();
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/latest?amount=100&from=USD&to=EUR');
        });
    });

    describe('getAllLatestCurrenciesFromTo', () => {
        it('should call httpService.get with correct URL', async () => {
            const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({} as AxiosResponse));
            await service.getAllLatestCurrenciesFromTo('USD', 'EUR').toPromise();
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/latest?from=USD&to=EUR');
        });
    });

    describe('getAllHistoricalCurrenciesFromTo', () => {
        it('should call httpService.get with correct URL', async () => {
            const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({} as AxiosResponse));
            await service.getAllHistoricalCurrenciesFromTo('USD', 'EUR', '2024-01-01', '2024-01-02').toPromise();
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/2024-01-01..2024-01-02?from=USD&to=EUR');
        });
    });
});