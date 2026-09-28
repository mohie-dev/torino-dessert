import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('store_settings')
export class StoreSetting extends BaseEntity {
    @Column({ name: 'store_name', type: 'varchar', length: 150 })
    storeName: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    whatsapp: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
    logoUrl: string;

    @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
    deliveryFee: number;

    @Column({ name: 'is_open', type: 'boolean', default: true })
    isOpen: boolean;
}