import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, ValidateNested, IsArray, ArrayNotEmpty } from 'class-validator';


class PriceDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateCheckoutSessionDto {

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PriceDto)
  priceList: PriceDto[];

  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
