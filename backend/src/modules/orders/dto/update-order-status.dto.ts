import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '../../../utils/enums.js';

export class UpdateOrderStatusDto {
    @ApiProperty({ description: 'New status for the order', enum: OrderStatus })
    @IsEnum(OrderStatus)
    @IsNotEmpty()
    status: OrderStatus;
}