import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @RequirePermissions(Permission.PRODUCTS_CREATE)
    @ApiOperation({ summary: 'Create a new category' })
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @RequirePermissions(Permission.PRODUCTS_READ)
    @ApiOperation({ summary: 'Get all categories' })
    findAll() {
        return this.categoriesService.findAll(true);
    }

    @Get(':id')
    @RequirePermissions(Permission.PRODUCTS_READ)
    @ApiOperation({ summary: 'Get a category by ID' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions(Permission.PRODUCTS_UPDATE)
    @ApiOperation({ summary: 'Update a category' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @RequirePermissions(Permission.PRODUCTS_DELETE)
    @ApiOperation({ summary: 'Soft delete (deactivate) a category' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.categoriesService.remove(id);
    }
}