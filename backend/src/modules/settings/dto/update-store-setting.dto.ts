import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateStoreSettingDto {
    @ApiPropertyOptional({ example: 'Torino Dessert' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    storeName?: string;

    @ApiPropertyOptional({ example: '+201012345678' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiPropertyOptional({ example: '+201012345678' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    whatsapp?: string;

    @ApiPropertyOptional({ example: 'https://facebook.com/torinodessert' })
    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    facebookUrl?: string;

    @ApiPropertyOptional({ example: 'https://instagram.com/torinodessert' })
    @IsOptional()
    @IsUrl()
    @MaxLength(255)
    instagramUrl?: string;

    @ApiPropertyOptional({ example: 25.00 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    deliveryFee?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isOpen?: boolean;
}