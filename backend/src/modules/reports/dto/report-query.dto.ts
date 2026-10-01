import { IsDateString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReportQueryDto {
    @ApiProperty({ example: '2026-10-01T00:00:00.000Z', description: 'Start date for the report' })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({ example: '2026-10-31T23:59:59.000Z', description: 'End date for the report' })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;
}

export class TopProductsQueryDto extends ReportQueryDto {
    @ApiPropertyOptional({ example: 5, description: 'Number of top products to return', default: 5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 5;
}