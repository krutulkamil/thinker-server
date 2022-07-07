import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    readonly password: string;
}