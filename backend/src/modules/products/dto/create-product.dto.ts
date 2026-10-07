import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    IsUrl,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

export class ProductImageDto {
    @ApiProperty({ example: 'https://example.com/images/cake.jpg', description: 'The image URL' })
    @IsUrl()
    @IsNotEmpty()
    url: string;

    @ApiPropertyOptional({ example: 'Delicious chocolate cake top view' })
    @IsOptional()
    @IsString()
    altText?: string;

    @ApiPropertyOptional({ example: 1, description: 'Display order of the image' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sortOrder?: number;
}

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

    @ApiPropertyOptional({ type: [ProductImageDto], description: 'Array of product images' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductImageDto)
    images?: ProductImageDto[];

    @ApiPropertyOptional({
        example: ['123e4567-e89b-12d3-a456-426614174000'],
        description: 'Array of associated tag UUIDs',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    tagIds?: string[];

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'The UUID of the category this product belongs to',
    })
    @IsUUID('4')
    @IsNotEmpty()
    categoryId: string;
}