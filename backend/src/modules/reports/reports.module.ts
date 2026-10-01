import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule { }