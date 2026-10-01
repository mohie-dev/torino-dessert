import { IsEmail, IsString, IsNotEmpty, IsUUID, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'Ahmed', description: 'The first name of the staff member' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiPropertyOptional({ example: 'Mohsen', description: 'The last name of the staff member' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ example: 'ahmed@torinodessert.com', description: 'Unique email address for login' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'StrongPass123', minLength: 6, description: 'Password for the account' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The UUID of the assigned Role' })
    @IsUUID()
    @IsNotEmpty()
    roleId: string;
}