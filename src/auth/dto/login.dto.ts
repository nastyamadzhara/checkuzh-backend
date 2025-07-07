import {IsString, MaxLength, MinLength} from 'class-validator';

export class LoginDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    nickname: string;

    @IsString()
    @IsString()
    @MinLength(6)
    password: string;
}
