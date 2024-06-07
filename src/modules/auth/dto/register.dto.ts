import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class RegisterPayloadDto {

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
}