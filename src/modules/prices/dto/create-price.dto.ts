import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePriceDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  unit_amount: number;

  @IsString()
  @IsNotEmpty()
  product: string;
}
