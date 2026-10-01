import { IsString, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../../utils/enums.js';

export class CreateRoleDto {
    @ApiProperty({ example: 'Cashier', description: 'Unique name of the role' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        enum: Permission,
        isArray: true,
        example: [Permission.ORDERS_READ, Permission.ORDERS_UPDATE],
        description: 'List of permissions assigned to this role'
    })
    @IsArray()
    @IsEnum(Permission, { each: true })
    permissions: Permission[];
}