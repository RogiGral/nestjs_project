import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsCreditCard, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";


enum PaymentMethodType {
    CREDIT_CARD = 'card',
    VISA = 'pm_card_visa',
    MASTERCARD = 'pm_card_mastercard',
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

export class ChangePaymentMethodDto {
    @IsNotEmpty()
    @IsString()
    payment_method_id: string
}

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) { }
