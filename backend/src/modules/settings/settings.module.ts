import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import { StoreSetting } from './entities/store-setting.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([StoreSetting])],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }