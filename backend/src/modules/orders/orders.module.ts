import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { CustomersModule } from '../customers/customers.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem]),
        CustomersModule,
        ProductsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule { }