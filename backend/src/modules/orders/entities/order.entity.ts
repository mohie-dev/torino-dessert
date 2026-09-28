import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { OrderStatus, PaymentMethod } from '../../../utils/enums.js';
import { Customer } from '../../customers/entities/customer.entity.js';
import { OrderItem } from './order-item.entity.js';

@Entity('orders')
export class Order extends BaseEntity {
    @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
    orderNumber: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    // --- Snapshots ---
    @Column({ name: 'customer_name', type: 'varchar', length: 100 })
    customerName: string;

    @Column({ name: 'customer_phone', type: 'varchar', length: 20 })
    customerPhone: string;

    @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
    customerEmail: string;

    @Column({ name: 'delivery_address', type: 'text' })
    deliveryAddress: string;
    // -----------------

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
    deliveryFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
    paymentMethod: PaymentMethod;

    @ManyToOne(() => Customer, (customer) => customer.orders)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    items: OrderItem[];
}