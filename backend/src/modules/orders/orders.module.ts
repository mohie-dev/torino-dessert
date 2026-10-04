import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { Order } from './entities/order.entity.js';
import { OrderItem } from './entities/order-item.entity.js';
import { CustomersModule } from '../customers/customers.module.js';
import { ProductsModule } from '../products/products.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { OrdersGateway } from './orders.gateway.js';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity.js';

@Module({
    imports: [
        JwtModule,
        TypeOrmModule.forFeature([Order, OrderItem, User]),
        CustomersModule,
        ProductsModule,
        SettingsModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersGateway],
})
export class OrdersModule { }