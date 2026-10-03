import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSetting } from './entities/store-setting.entity.js';
import { UpdateStoreSettingDto } from './dto/update-store-setting.dto.js';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(StoreSetting)
        private readonly settingsRepository: Repository<StoreSetting>,
    ) { }

    async getSettings(): Promise<StoreSetting> {
        let settings = await this.settingsRepository.findOne({ where: {} });
        if (!settings) {
            settings = this.settingsRepository.create({
                storeName: 'Torino Dessert',
                isOpen: true,
                deliveryFee: 20.00,
            });
            await this.settingsRepository.save(settings);
        }
        return settings;
    }

    async updateSettings(updateDto: UpdateStoreSettingDto): Promise<StoreSetting> {
        const settings = await this.getSettings(); 
        Object.assign(settings, updateDto);
        return await this.settingsRepository.save(settings);
    }
}