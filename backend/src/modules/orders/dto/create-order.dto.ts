import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PaymentMethod } from '../../../utils/enums.js';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto.js';

export class CreateOrderItemDto {
    @ApiProperty({ description: 'Product ID' })
    @IsUUID('4')
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'Quantity required', example: 2 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer details' })
    @ValidateNested()
    @Type(() => CreateCustomerDto)
    @IsNotEmpty()
    customer: CreateCustomerDto;

    @ApiProperty({ description: 'List of products to order', type: [CreateOrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @IsNotEmpty()
    items: CreateOrderItemDto[];

    @ApiProperty({ description: 'Delivery Address', example: '123 Main St, Mansoura' })
    @IsString()
    @IsNotEmpty()
    deliveryAddress: string;

    @ApiPropertyOptional({ description: 'Any extra notes from the customer', example: 'Please do not ring the bell' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Payment method chosen by customer', enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod: PaymentMethod;
}