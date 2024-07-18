import { Type } from 'class-transformer';
import { IsString, IsNumber, IsDateString, ValidateNested, IsNotEmpty, ArrayNotEmpty, IsArray, IsIn, IsObject, IsOptional } from 'class-validator';

const validCurrencies = ["pln", "usd"]
const validTaxes = ["20%", "0%"]

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  line2: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsOptional()
  state?: string;
}

export class ConsumerDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  phoneNumber: string | null;
}

export class CompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  tin_number: string;
}

export class LineItemsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount_total: number;

  @IsNumber()
  @IsNotEmpty()
  amount_unit: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(validCurrencies)
  currency: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(validTaxes)
  tax_value: string;
}

export class CreateInvoiceDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConsumerDto)
  consumer: ConsumerDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => LineItemsDto)
  lineItems: LineItemsDto[];
}