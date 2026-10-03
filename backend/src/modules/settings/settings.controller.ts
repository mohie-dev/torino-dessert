import { Controller, Get, Body, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto.js';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';

@ApiTags('Store Settings')
@Controller('api/v1/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get current store settings (Public)' })
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Patch()
    @ApiBearerAuth()
    @RequirePermissions(Permission.SETTINGS_MANAGE) 
    @ApiOperation({ summary: 'Update store settings (Admin only)' })
    updateSettings(@Body() updateDto: UpdateStoreSettingDto) {
        return this.settingsService.updateSettings(updateDto);
    }
}