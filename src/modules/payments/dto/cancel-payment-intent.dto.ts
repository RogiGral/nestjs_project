import { IsNotEmpty, IsString } from "class-validator";

export class CancelPaymentDto {
    @IsString()
    @IsNotEmpty()
    paymentIntentId: string;

}