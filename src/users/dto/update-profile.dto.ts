import {IsString, IsEmail, IsOptional, MaxLength, IsUrl, IsEnum} from 'class-validator';
export enum UserType {
    Local = 'local',
    Tourist = 'tourist',
}
export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(UserType, { message: 'Тип користувача повинен бути local або tourist' })
    @MaxLength(100)
    userType?: UserType;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    bio?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;
}
