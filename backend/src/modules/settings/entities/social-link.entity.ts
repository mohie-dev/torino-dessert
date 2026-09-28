import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('social_links')
export class SocialLink extends BaseEntity {
    @Column({ type: 'varchar', length: 50 })
    platform: string;

    @Column({ type: 'varchar', length: 500 })
    url: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;
}