import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    @ApiBearerAuth()
    @RequirePermissions(Permission.PRODUCTS_CREATE)
    @ApiOperation({ summary: 'Create a new tag' })
    create(@Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(createTagDto);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all tags' })
    findAll() {
        return this.tagsService.findAll();
    }

    @Delete(':id')
    @ApiBearerAuth()
    @RequirePermissions(Permission.PRODUCTS_DELETE)
    @ApiOperation({ summary: 'Delete a tag' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.tagsService.remove(id);
    }
}