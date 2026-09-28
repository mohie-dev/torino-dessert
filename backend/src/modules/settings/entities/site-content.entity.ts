import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { ContentType } from '../../../utils/enums.js';

@Entity('site_contents')
export class SiteContent extends BaseEntity {
    @Column({ type: 'varchar', length: 100 })
    section: string;

    @Column({ name: 'content_key', type: 'varchar', length: 100, unique: true })
    contentKey: string;

    @Column({ type: 'enum', enum: ContentType, default: ContentType.TEXT })
    type: ContentType;

    @Column({ type: 'text' })
    value: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}