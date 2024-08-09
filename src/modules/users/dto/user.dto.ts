import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';


export class AddressDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  country: string;

  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsOptional()
  state?: string;
}

export class TaxDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CompanyDto {

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  name: string;

}

export class CustomerDto {

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString()
  @IsPhoneNumber('PL' || 'US' || "DE" || "CZ")
  @IsNotEmpty()
  phone: string;

}

export class UserDto {

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;
}

export class CreateUserDto extends UserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsString({ each: true })
  claims: string[];
}

export class RegisterUserDto extends UserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateIf((o) => o.claims != undefined)
  @IsArray()
  @IsString({ each: true })
  claims: string[];
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }
