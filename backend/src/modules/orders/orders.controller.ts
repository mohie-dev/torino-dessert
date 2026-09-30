import { Controller, Post, Body, Get, Param, Patch, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { Permission } from '../../utils/enums.js';
import { OrderFilterDto } from './dto/order-filter.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Public()
    @Post()
    @ApiOperation({ summary: 'Storefront: Submit a new order (Checkout)' })
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @ApiBearerAuth()
    @Get()
    @RequirePermissions(Permission.ORDERS_READ)
    @ApiOperation({ summary: 'Dashboard: Get all orders' })
    findAll(@Query() filterDto: OrderFilterDto) {
        return this.ordersService.findAll(filterDto);
    }

    @ApiBearerAuth()
    @Get('stats')
    @RequirePermissions(Permission.DASHBOARD_READ)
    @ApiOperation({ summary: 'Dashboard: Get quick statistics' })
    getDashboardStats() {
        return this.ordersService.getDashboardStats();
    }

    @ApiBearerAuth()
    @Get(':id')
    @RequirePermissions(Permission.ORDERS_READ)
    @ApiOperation({ summary: 'Dashboard: Get order details by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.ordersService.findOne(id);
    }

    @ApiBearerAuth()
    @Patch(':id/status')
    @RequirePermissions(Permission.ORDERS_UPDATE)
    @ApiOperation({ summary: 'Dashboard: Update order status' })
    updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto
    ) {
        return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
    }
}