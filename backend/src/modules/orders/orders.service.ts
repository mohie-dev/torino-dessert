import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CustomersService } from '../customers/customers.service.js';
import { ProductsService } from '../products/products.service.js';
import { OrderStatus } from '../../utils/enums.js';
import { OrderFilterDto } from './dto/order-filter.dto.js';
import { SettingsService } from '../settings/settings.service.js';
import { OrdersGateway } from './orders.gateway.js';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly ordersRepository: Repository<Order>,
        private readonly customersService: CustomersService,
        private readonly productsService: ProductsService,
        private readonly settingsService: SettingsService,
        private readonly ordersGateway: OrdersGateway,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const settings = await this.settingsService.getSettings();

        if (!settings.isOpen) {
            throw new BadRequestException('عفواً، المطعم مغلق حالياً ولا يمكننا استقبال طلبات جديدة.');
        }

        const { customer: customerDto, items, deliveryAddress, notes, paymentMethod } = createOrderDto;

        const customer = await this.customersService.findOrCreate(customerDto);

        const orderItems: OrderItem[] = [];
        let orderSubtotal = 0;

        for (const itemDto of items) {
            const product = await this.productsService.findOne(itemDto.productId);

            if (!product.isAvailable || product.isArchived) {
                throw new BadRequestException(`Product ${product.name} is currently unavailable.`);
            }

            const itemSubtotal = product.price * itemDto.quantity;
            orderSubtotal += itemSubtotal;

            const orderItem = new OrderItem();
            orderItem.productId = product.id;
            orderItem.productName = product.name;
            orderItem.unitPrice = product.price;
            orderItem.quantity = itemDto.quantity;
            orderItem.subtotal = itemSubtotal;

            orderItems.push(orderItem);
        }

        const deliveryFee = Number(settings.deliveryFee);
        const grandTotal = orderSubtotal + deliveryFee;

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const order = this.ordersRepository.create({
            orderNumber,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            deliveryAddress,
            notes,
            subtotal: orderSubtotal,
            deliveryFee,
            total: grandTotal,
            paymentMethod,
            items: orderItems,
        });

        const savedOrder = await this.ordersRepository.save(order);

        this.ordersGateway.notifyNewOrder({
            orderNumber: savedOrder.orderNumber,
            total: savedOrder.total,
        });

        return savedOrder;
    }

    async findAll(filterDto: OrderFilterDto) {
        const { status, search, startDate, endDate, page = 1, limit = 10 } = filterDto;

        const query = this.ordersRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items'); // بنجيب المنتجات اللي جوة الطلب كمان

        if (status) {
            query.andWhere('order.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(order.orderNumber ILIKE :search OR order.customerPhone ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (startDate) {
            query.andWhere('order.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('order.createdAt <= :endDate', { endDate: `${endDate} 23:59:59` });
        }

        query.orderBy('order.createdAt', 'DESC');
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);

        const [data, total] = await query.getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: {
                items: true,
                customer: true
            },
        });
        if (!order) throw new NotFoundException(`Order #${id} not found`);
        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id);
        order.status = status;
        const updatedOrder = await this.ordersRepository.save(order);
        this.ordersGateway.notifyOrderStatusUpdated({
            orderNumber: updatedOrder.orderNumber,
            status: updatedOrder.status,
        });
        return updatedOrder;
    }

    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrdersCount,
            activeOrdersCount,
            todaysOrders,
            revenueResult
        ] = await Promise.all([
            this.ordersRepository.count(),

            this.ordersRepository.count({
                where: { status: In([OrderStatus.PENDING, OrderStatus.PREPARING]) }
            }),

            this.ordersRepository.find({
                where: { createdAt: MoreThanOrEqual(today) }
            }),

            this.ordersRepository
                .createQueryBuilder('order')
                .select('SUM(order.total)', 'totalRevenue')
                .where('order.status != :status', { status: OrderStatus.CANCELLED })
                .getRawOne()
        ]);

        const todaysRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.total), 0);

        return {
            totalOrders: totalOrdersCount,
            activeOrders: activeOrdersCount,
            todaysOrders: todaysOrders.length,
            todaysRevenue: todaysRevenue,
            totalRevenue: Number(revenueResult.totalRevenue) || 0,
        };
    }

    async cancelOrder(id: string): Promise<Order> {
        const order = await this.findOne(id);
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(
                `Cannot cancel order. Current status is ${order.status}. Only PENDING orders can be cancelled.`
            );
        }
        order.status = OrderStatus.CANCELLED;
        const cancelledOrder = await this.ordersRepository.save(order);
        this.ordersGateway.notifyOrderStatusUpdated({
            orderNumber: cancelledOrder.orderNumber,
            status: cancelledOrder.status,
        });
        return cancelledOrder;
    }
}