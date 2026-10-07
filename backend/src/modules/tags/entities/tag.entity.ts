import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';

@Entity('tags')
export class Tag extends BaseEntity {
    @Column({ type: 'varchar', length: 50, unique: true })
    name: string;

    @Column({ name: 'color_hex', type: 'varchar', length: 7, nullable: true })
    colorHex: string; 
}