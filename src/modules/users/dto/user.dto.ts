import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;


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

  @ValidateIf(o => o.claims != undefined)
  @IsArray()
  @IsString({ each: true })
  claims: string[];

}

export class UpdateUserDto extends CreateUserDto {

}