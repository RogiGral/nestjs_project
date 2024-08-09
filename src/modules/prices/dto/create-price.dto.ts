import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';

enum IntervalUnit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

class RecurringDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  interval_count: number;

  @IsEnum(IntervalUnit)
  @IsNotEmpty()
  interval: IntervalUnit;

}

export class CreatePriceDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value))
  unit_amount: number;

  @IsString()
  @IsNotEmpty()
  product: string;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean

  @ValidateNested()
  @Type(() => RecurringDto)
  recurring?: RecurringDto
}
