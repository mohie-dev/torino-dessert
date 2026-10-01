import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ToggleStatusDto } from './dto/toggle-status.dto.js';
import { Permission } from '../../utils/enums.js';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';

@ApiTags('Users / Staff')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @RequirePermissions(Permission.USERS_MANAGE)
    @ApiOperation({ summary: 'Create a new staff member' })
    @ApiResponse({ status: 201, description: 'User successfully created.' })
    @ApiResponse({ status: 409, description: 'Email already exists.' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @RequirePermissions(Permission.USERS_MANAGE)
    @ApiOperation({ summary: 'Get all staff members' })
    @ApiResponse({ status: 200, description: 'List of all users.' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @RequirePermissions(Permission.USERS_MANAGE)
    @ApiOperation({ summary: 'Get a specific user by ID' })
    @ApiResponse({ status: 200, description: 'The user details.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @RequirePermissions(Permission.USERS_MANAGE)
    @ApiOperation({ summary: 'Update user details or role' })
    @ApiResponse({ status: 200, description: 'User successfully updated.' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/status')
    @RequirePermissions(Permission.USERS_MANAGE)
    @ApiOperation({ summary: 'Activate or Deactivate a user' })
    @ApiResponse({ status: 200, description: 'User status successfully updated.' })
    toggleStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() toggleStatusDto: ToggleStatusDto
    ) {
        return this.usersService.toggleStatus(id, toggleStatusDto);
    }
}