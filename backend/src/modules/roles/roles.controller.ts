import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { Permission } from '../../utils/enums.js';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @RequirePermissions(Permission.ROLES_MANAGE)
    @ApiOperation({ summary: 'Create a new custom role' })
    @ApiResponse({ status: 201, description: 'Role successfully created.' })
    @ApiResponse({ status: 409, description: 'Role name already exists.' })
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @RequirePermissions(Permission.ROLES_MANAGE)
    @ApiOperation({ summary: 'Get all roles' })
    @ApiResponse({ status: 200, description: 'List of all available roles.' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Patch(':id')
    @RequirePermissions(Permission.ROLES_MANAGE)
    @ApiOperation({ summary: 'Update an existing role' })
    @ApiResponse({ status: 200, description: 'Role successfully updated.' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateRoleDto: UpdateRoleDto
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @RequirePermissions(Permission.ROLES_MANAGE)
    @ApiOperation({ summary: 'Delete a role' })
    @ApiResponse({ status: 200, description: 'Role successfully deleted.' })
    @ApiResponse({ status: 400, description: 'Cannot delete a role that is assigned to users.' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.rolesService.remove(id);
    }
}