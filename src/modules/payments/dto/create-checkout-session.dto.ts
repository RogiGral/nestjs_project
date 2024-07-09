import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateCheckoutSessionDto {
    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsNumber()
    @IsNotEmpty()
    unitAmount: number;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsString()
    @IsNotEmpty()
    successUrl: string;

    @IsString()
    @IsNotEmpty()
    cancelUrl: string;

}