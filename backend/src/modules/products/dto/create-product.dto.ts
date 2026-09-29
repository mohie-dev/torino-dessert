import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsUrl, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Chocolate Cake' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @ApiPropertyOptional({ example: 'Rich chocolate cake with fudge frosting' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 250.50 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 'https://cloudinary.com/your-image-url.jpg' })
    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    imageUrl?: string;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiProperty({ description: 'The UUID of the category this product belongs to' })
    @IsUUID('4')
    @IsNotEmpty()
    categoryId: string;
}