import { Transform } from "class-transformer"
import { IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"
import moment from "moment"

export class CurrentRatePayloadDto {

    @IsString()
    @IsNotEmpty()
    from: string

    @IsString()
    @IsNotEmpty()
    to: string

    @IsNumber()
    amount?: number

    @IsDateString()
    @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
    startDate?: Date

    @IsDateString()
    @Transform(({ value }) => moment(value).format('YYYY-MM-DD'))
    endDate?: Date
}