import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Role } from '../../roles/entities/role.entity.js';

@Entity('users')
export class User extends BaseEntity {
    @Column({
        name: 'first_name',
        type: 'varchar',
        length: 100,
    })
    firstName: string;

    @Column({
        name: 'last_name',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    lastName: string;

    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
    })
    email: string;

    @Column({
        name: 'password_hash',
        type: 'varchar',
        length: 255,
        select: false,
    })
    passwordHash: string;

    @ManyToOne(() => Role, (role) => role.users, {
        eager: true,
        nullable: true
    })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ type: 'uuid', name: 'role_id', nullable: true })
    roleId: string;

    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;
}