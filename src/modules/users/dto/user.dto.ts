import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateIf(o => o.claims != undefined)
  @IsArray()
  @IsString({ each: true })
  claims: string[];

}
