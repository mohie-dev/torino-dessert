import { IsString, IsNotEmpty, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTagDto {
    @ApiProperty({ example: 'Best Seller' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiPropertyOptional({ example: '#D4AF37' })
    @IsOptional()
    @IsString()
    @Matches(/^#([0-9A-F]{3}){1,2}$/i, { message: 'يجب أن يكون لون Hex صحيح' })
    colorHex?: string;
}