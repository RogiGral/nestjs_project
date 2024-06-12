import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyController } from './currencies.controller';
import { CurrencyService } from '../services';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { of, throwError } from 'rxjs';
import { validate } from 'class-validator';

jest.mock('class-transformer', () => ({
    Transform: jest.fn((options) => options),
}));

jest.mock('class-validator', () => ({
    validate: jest.fn(),
    IsDateString: jest.fn().mockReturnValue(true),
    IsNotEmpty: jest.fn().mockReturnValue(true),
    IsNumber: jest.fn().mockReturnValue(true),
    IsString: jest.fn().mockReturnValue(true),
    IsOptional: jest.fn().mockReturnValue(true),
}));

describe('CurrencyController', () => {
    let controller: CurrencyController;
    let currencyService: CurrencyService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CurrencyController],
            providers: [
                {
                    provide: CurrencyService,
                    useValue: {
                        convertCurrencyFromTo: jest.fn(),
                        getAllHistoricalCurrenciesFromTo: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<CurrencyController>(CurrencyController);
        currencyService = module.get<CurrencyService>(CurrencyService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('currentCurrencyStatus', () => {
        it('should return currency conversion data', async () => {
            const payload = { from: 'USD', to: 'EUR', amount: 100 };
            const mockResponse: AxiosResponse = {
                data: {
                    amount: 1,
                    base: 'USD',
                    date: '2024-06-07',
                    rates: {
                        PLN: 3.9347,
                    },
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            jest
                .spyOn(currencyService, 'convertCurrencyFromTo')
                .mockReturnValue(of(mockResponse));

            const result = await controller.currentCurrencyStatus(payload);
            expect(result).toEqual(mockResponse.data);
        });
        it('should throw an error when currency conversion fails', async () => {
            const payload = { from: 'USD', to: 'EUR', amount: 100 };
            const errorMessage = 'Currency conversion failed';
            jest.spyOn(currencyService, 'convertCurrencyFromTo').mockReturnValue(throwError(errorMessage));

            try {
                await controller.currentCurrencyStatus(payload);
            } catch (error) {
                expect(error).toEqual(errorMessage);
            }
        });
    });

    describe('historicalCurrencyStatus', () => {
        it('should return historical currency data', async () => {
            const payload = {
                from: 'USD',
                to: 'EUR',
                startDate: '2024-01-01',
                endDate: '2024-01-03',
            };
            const mockResponse: AxiosResponse = {
                data: {
                    amount: 1,
                    base: 'USD',
                    start_date: '2024-01-02',
                    end_date: '2024-01-03',
                    rates: {
                        '2024-01-02': {
                            PLN: 3.9894,
                        },
                        '2024-01-03': {
                            PLN: 3.9965,
                        },
                    },
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as InternalAxiosRequestConfig,
            };
            jest
                .spyOn(currencyService, 'getAllHistoricalCurrenciesFromTo')
                .mockReturnValue(of(mockResponse));

            const result = await controller.historicalCurrencyStatus(payload);
            expect(result).toEqual(mockResponse.data);
        });
        it('should throw an error when fetching historical currency data fails', async () => {
            const payload = { from: 'USD', to: 'EUR', startDate: '2024-01-01', endDate: '2024-01-03' };
            const errorMessage = 'Error fetching historical currency data';
            jest.spyOn(currencyService, 'getAllHistoricalCurrenciesFromTo').mockReturnValue(throwError(errorMessage));
            (validate as jest.Mock).mockResolvedValue([]);

            try {
                await controller.historicalCurrencyStatus(payload);
            } catch (error) {
                expect(error).toEqual(errorMessage);
            }
        });
    });
});
