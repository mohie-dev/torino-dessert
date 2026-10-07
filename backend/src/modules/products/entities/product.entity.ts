import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, type Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Category } from '../../categories/entities/category.entity.js';
import { ProductImage } from './product-image.entity.js';
import { Tag } from '../../tags/entities/tag.entity.js';

@Entity('products')
export class Product extends BaseEntity {
    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'portion_size', type: 'varchar', length: 100, nullable: true })
    portionSize: string;

    @Column({ name: 'is_available', type: 'boolean', default: true })
    isAvailable: boolean;

    @Column({ name: 'is_archived', type: 'boolean', default: false })
    isArchived: boolean;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'category_id' })
    category: Relation<Category>;

    @OneToMany(() => ProductImage, (productImage) => productImage.product, { cascade: true })
    images: Relation<ProductImage[]>;

    @ManyToMany(() => Tag)
    @JoinTable({
        name: 'product_tags',
        joinColumn: { name: 'product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' }
    })
    tags: Relation<Tag[]>;
}