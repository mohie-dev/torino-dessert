import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const existingRole = await this.roleRepository.findOne({ where: { name: createRoleDto.name } });
        if (existingRole) {
            throw new ConflictException(`Role with name '${createRoleDto.name}' already exists.`);
        }

        const role = this.roleRepository.create(createRoleDto);
        return await this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find();
    }

    async findOne(id: string): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
        const role = await this.findOne(id);

        if (updateRoleDto.name && updateRoleDto.name !== role.name) {
            const existingRole = await this.roleRepository.findOne({ where: { name: updateRoleDto.name } });
            if (existingRole) {
                throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists.`);
            }
        }

        Object.assign(role, updateRoleDto);
        return await this.roleRepository.save(role);
    }

    async remove(id: string): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: {
                users: true
            }
        });

        if (!role) throw new NotFoundException(`Role with ID ${id} not found`);

        if (role.name === 'Super Admin') {
            throw new BadRequestException('Cannot delete the Super Admin role');
        }

        if (role.users && role.users.length > 0) {
            throw new BadRequestException('Cannot delete role because it is assigned to one or more users');
        }

        await this.roleRepository.remove(role);
    }
}