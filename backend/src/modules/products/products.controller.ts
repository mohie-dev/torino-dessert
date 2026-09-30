import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';
import { ProductFilterDto } from './dto/product-filter.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @RequirePermissions(Permission.PRODUCTS_CREATE)
    @ApiOperation({ summary: 'Create a new product' })
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    @Get()
    @RequirePermissions(Permission.PRODUCTS_READ)
    @ApiOperation({ summary: 'Get products with pagination and filters' })
    findAll(@Query() filterDto: ProductFilterDto) {
        return this.productsService.findAll(filterDto);
    }

    @Public()
    @Get('storefront')
    @ApiOperation({ summary: 'Storefront: Get available products for customers' })
    findAllForStorefront(@Query() filterDto: ProductFilterDto) {
        filterDto.isAvailable = true;
        filterDto.isArchived = false;
        return this.productsService.findAll(filterDto);
    }

    @Get(':id')
    @RequirePermissions(Permission.PRODUCTS_READ)
    @ApiOperation({ summary: 'Get a product by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions(Permission.PRODUCTS_UPDATE)
    @ApiOperation({ summary: 'Update a product' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateProductDto: UpdateProductDto
    ) {
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    @RequirePermissions(Permission.PRODUCTS_DELETE)
    @ApiOperation({ summary: 'Archive a product' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.remove(id);
    }

    @Patch(':id/toggle-availability')
    @RequirePermissions(Permission.PRODUCTS_UPDATE)
    @ApiOperation({ summary: 'Quick toggle product availability status' })
    toggleAvailability(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.toggleAvailability(id);
    }

    @Patch(':id/restore')
    @RequirePermissions(Permission.PRODUCTS_UPDATE)
    @ApiOperation({ summary: 'Restore an archived product' })
    restore(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.restore(id);
    }
}