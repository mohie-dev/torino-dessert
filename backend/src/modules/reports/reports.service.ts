import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';
import { OrderStatus } from '../../utils/enums.js';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,
    ) { }

    async getSalesReport(startDate: string, endDate: string) {
        const stats = await this.orderRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'totalOrders')
            .addSelect(`SUM(CASE WHEN order.status != :cancelled THEN order.total ELSE 0 END)`, 'totalRevenue')
            .addSelect(`COUNT(CASE WHEN order.status = :completed THEN 1 ELSE NULL END)`, 'completedOrders')
            .addSelect(`COUNT(CASE WHEN order.status = :cancelled THEN 1 ELSE NULL END)`, 'cancelledOrders')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .setParameter('cancelled', OrderStatus.CANCELLED)
            .setParameter('completed', OrderStatus.COMPLETED)
            .getRawOne();

        const totalOrders = Number(stats.totalOrders) || 0;
        const totalRevenue = Number(stats.totalRevenue) || 0;
        const cancelledOrders = Number(stats.cancelledOrders) || 0;
        const completedOrders = Number(stats.completedOrders) || 0;

        const validOrdersCount = totalOrders - cancelledOrders;
        const averageOrderValue = validOrdersCount > 0 ? (totalRevenue / validOrdersCount) : 0;

        return {
            dateRange: { startDate, endDate },
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            averageOrderValue: Number(averageOrderValue.toFixed(2)),
        };
    }

    async getTopProducts(startDate: string, endDate: string, limit: number) {
        const topProducts = await this.orderItemRepository.createQueryBuilder('item')
            .innerJoin('item.order', 'order')
            .innerJoin('item.product', 'product')
            .select('product.id', 'productId')
            .addSelect('product.name', 'productName')
            .addSelect('SUM(item.quantity)', 'totalQuantitySold')
            .where('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
            .groupBy('product.id')
            .addGroupBy('product.name')
            .orderBy('"totalQuantitySold"', 'DESC')
            .limit(limit)
            .getRawMany();

        return topProducts.map(product => ({
            ...product,
            totalQuantitySold: Number(product.totalQuantitySold)
        }));
    }
}