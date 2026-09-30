import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { CustomerFilterDto } from './dto/customer-filter.dto.js';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customersRepository: Repository<Customer>,
    ) { }

    async findOrCreate(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const { phone, name, email } = createCustomerDto;

        let customer = await this.customersRepository.findOne({ where: { phone } });

        if (!customer) {
            customer = this.customersRepository.create({ phone, name, email });
            return await this.customersRepository.save(customer);
        }

        let isUpdated = false;

        if (name && customer.name !== name) {
            customer.name = name;
            isUpdated = true;
        }

        if (email && customer.email !== email) {
            customer.email = email;
            isUpdated = true;
        }

        if (isUpdated) {
            return await this.customersRepository.save(customer);
        }

        return customer;
    }

    async findById(id: string): Promise<Customer | null> {
        return this.customersRepository.findOne({ where: { id } });
    }

    async findAll(filterDto: CustomerFilterDto) {
        const { search, page = 1, limit = 10 } = filterDto;

        const query = this.customersRepository.createQueryBuilder('customer');

        if (search) {
            query.andWhere(
                '(customer.name ILIKE :search OR customer.phone ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        query.orderBy('customer.createdAt', 'DESC');
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

    async findOneWithOrders(id: string) {
        const customer = await this.customersRepository.findOne({
            where: { id },
            relations: {
                orders: true
            },
            order: {
                orders: { createdAt: 'DESC' }
            }
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
    }
}