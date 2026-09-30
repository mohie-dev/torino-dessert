import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Customer])],
    providers: [CustomersService],
    exports: [CustomersService],
})
export class CustomersModule { }