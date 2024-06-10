import { Transform } from "class-transformer"
import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"
import * as moment from 'moment';

export class FindCurrencyPayloadDto {

    @IsString()
    @IsNotEmpty()
    from: string

    @IsString()
    @IsNotEmpty()
    to: string

    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    amount: number;

    @IsDateString()
    @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
    startDate?: string

    @IsDateString()
    @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
    endDate?: string
}