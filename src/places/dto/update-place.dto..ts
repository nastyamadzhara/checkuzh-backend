import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdatePlaceDto {
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: 'imageUrl має бути валідною URL-адресою' })
    imageUrl?: string;
}
