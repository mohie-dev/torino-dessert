import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ToggleStatusDto } from './dto/toggle-status.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

        const user = this.userRepository.create({
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            passwordHash: passwordHash,
            role: { id: createUserDto.roleId },
            isActive: true,
        });

        const savedUser = await this.userRepository.save(user);
        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        const updateData: any = { ...updateUserDto };
        if (updateUserDto.roleId) {
            updateData.role = { id: updateUserDto.roleId };
            delete updateData.roleId;
        }

        Object.assign(user, updateData);
        return await this.userRepository.save(user);
    }

    async toggleStatus(id: string, toggleStatusDto: ToggleStatusDto): Promise<User> {
        const user = await this.findOne(id);
        if (user.email === process.env.SEED_ADMIN_EMAIL) {
            throw new BadRequestException('Cannot deactivate the primary Super Admin account');
        }
        user.isActive = toggleStatusDto.isActive;
        return await this.userRepository.save(user);
    }
}