import { IsNotEmpty, IsString } from 'class-validator';

export class LoginPayloadDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
