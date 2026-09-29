import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST ~/api/v1/auth/login
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login to dashboard' })
    @ApiResponse({ status: 200, description: 'Successfully logged in, returns access token.' })
    @ApiResponse({ status: 401, description: 'Invalid email or password.' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    // GET ~/api/v1/auth/me
    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile and permissions' })
    @ApiResponse({ status: 200, description: 'Returns the current user and their permissions.' })
    async getMe(@CurrentUser() user: AuthenticatedUser) {
        return user;
    }
}