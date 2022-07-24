import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    readonly bio: string;

    readonly image: string;
}
