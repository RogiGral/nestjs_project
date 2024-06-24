import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { CurrencyService } from './currencies.service';
import { AxiosResponse } from 'axios';
import { firstValueFrom, of } from 'rxjs';


describe('CurrencyService', () => {
    let service: CurrencyService;
    let httpService: HttpService;

    beforeEach(async () => {

        const httpServiceMock = {
            get: jest.fn()
        };


        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CurrencyService,
                {
                    provide: HttpService,
                    useValue: httpServiceMock,
                },
            ],
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
            await firstValueFrom(service.convertCurrencyFromTo('USD', 'EUR', 100))
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/latest?amount=100&from=USD&to=EUR');
        });
    });

    describe('getAllLatestCurrenciesFromTo', () => {
        it('should call httpService.get with correct URL', async () => {
            const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({} as AxiosResponse));
            await firstValueFrom(service.getAllLatestCurrenciesFromTo('USD', 'EUR'))
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/latest?from=USD&to=EUR');
        });
    });

    describe('getAllHistoricalCurrenciesFromTo', () => {
        it('should call httpService.get with correct URL', async () => {
            const spy = jest.spyOn(httpService, 'get').mockReturnValue(of({} as AxiosResponse));
            await firstValueFrom(service.getAllHistoricalCurrenciesFromTo('USD', 'EUR', '2024-01-01', '2024-01-02'))
            expect(spy).toHaveBeenCalledWith('https://api.frankfurter.app/2024-01-01..2024-01-02?from=USD&to=EUR');
        });
    });
});