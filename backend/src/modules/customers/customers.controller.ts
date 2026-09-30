import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service.js';
import { CustomerFilterDto } from './dto/customer-filter.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js'; 

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @RequirePermissions(Permission.CUSTOMERS_READ)
    @ApiOperation({ summary: 'Dashboard: Get all customers with pagination' })
    findAll(@Query() filterDto: CustomerFilterDto) {
        return this.customersService.findAll(filterDto);
    }

    @Get(':id')
    @RequirePermissions(Permission.CUSTOMERS_READ)
    @ApiOperation({ summary: 'Dashboard: Get customer details and their order history' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.customersService.findOneWithOrders(id);
    }
}