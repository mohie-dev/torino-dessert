import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email address of the dashboard user (case-insensitive).',
        example: 'admin@torino.com',
        format: 'email',
        maxLength: 255,
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        description: 'Account password.',
        example: 'StrongPassword123',
        format: 'password',
        maxLength: 72,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(72)
    password: string;
}