import { Entity, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Product } from './product.entity.js';

@Entity('product_images')
export class ProductImage extends BaseEntity {
    @Column({ type: 'varchar', length: 500 })
    url: string;

    @Column({ name: 'alt_text', type: 'varchar', length: 150, nullable: true })
    altText: string;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Relation<Product>;
}