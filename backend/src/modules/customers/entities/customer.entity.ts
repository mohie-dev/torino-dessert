import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Order } from '../../orders/entities/order.entity.js';

@Entity('customers')
export class Customer extends BaseEntity {
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];
}