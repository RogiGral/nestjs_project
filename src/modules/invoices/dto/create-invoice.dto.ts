import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
    @IsNumber()
    amount: number;

    @IsDateString()
    date: Date;

    @IsString()
    description: string;

    @IsString()
    userId: string;
}