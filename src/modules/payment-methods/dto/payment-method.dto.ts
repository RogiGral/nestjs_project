import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsCreditCard, IsEnum, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

enum PaymentMethodType {
    CREDIT_CARD = 'card',
}

class CardMethodDto {
    @IsString()
    @IsNotEmpty()
    @IsCreditCard()
    number: string;

    @IsNumber()
    @IsNotEmpty()
    @Max(12)
    @Min(1)
    exp_month: number;

    @IsNumber()
    @IsNotEmpty()
    @Max(99 * 100)
    @Min(new Date().getFullYear())
    exp_year: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    @MinLength(3)
    cvc: string;
}

export class CreatePaymentMethodDto {

    @IsEnum(PaymentMethodType)
    @IsNotEmpty()
    type: PaymentMethodType;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CardMethodDto)
    method: CardMethodDto;


}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) { }
