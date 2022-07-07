import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(32)
    readonly password: string;
}