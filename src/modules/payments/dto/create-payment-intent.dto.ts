import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    amount?: number;

}
