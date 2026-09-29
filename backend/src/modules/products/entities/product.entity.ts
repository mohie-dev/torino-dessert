import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Category } from '../../categories/entities/category.entity.js';

@Entity('products')
export class Product extends BaseEntity {
    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
    imageUrl: string;

    @Column({ name: 'is_available', type: 'boolean', default: true })
    isAvailable: boolean;

    @Column({ name: 'is_archived', type: 'boolean', default: false })
    isArchived: boolean;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Relation<Category>;
}