import { Entity, Column, OneToMany, Relation } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity('categories')
export class Category extends BaseEntity {
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => Product, (product) => product.category)
    products: Relation<Product>[];
}