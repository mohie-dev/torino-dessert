import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCustomerDto {
    @ApiProperty({ description: 'Customer full name', example: 'Ahmed Ali' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({ description: 'Customer phone number', example: '01012345678' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    @Matches(/^(?:\+20|0)?1[0125]\d{8}$/, {
        message: 'رقم الهاتف يجب أن يكون رقم موبايل مصري صحيح (مثال: 01012345678)',
    })
    phone: string;

    @ApiPropertyOptional({ description: 'Customer email address', example: 'ahmed@example.com' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail()
    @MaxLength(255)
    email?: string;
}