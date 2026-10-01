import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportQueryDto, TopProductsQueryDto } from './dto/report-query.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@Controller('api/v1/reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('sales')
    @RequirePermissions(Permission.REPORTS_READ)
    @ApiOperation({ summary: 'Get sales and revenue report for a date range' })
    @ApiResponse({ status: 200, description: 'Sales report successfully generated.' })
    getSalesReport(@Query() query: ReportQueryDto) {
        return this.reportsService.getSalesReport(query.startDate, query.endDate);
    }

    @Get('top-products')
    @RequirePermissions(Permission.REPORTS_READ)
    @ApiOperation({ summary: 'Get top selling products by quantity for a date range' })
    @ApiResponse({ status: 200, description: 'Top products successfully generated.' })
    getTopProducts(@Query() query: TopProductsQueryDto) {
        return this.reportsService.getTopProducts(query.startDate, query.endDate, query.limit);
    }
}