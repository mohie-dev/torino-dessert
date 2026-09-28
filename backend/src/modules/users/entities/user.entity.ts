import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { UserRole } from '../../../utils/enums.js';

@Entity('users')
export class User extends BaseEntity {
    @Column({ name: 'first_name', type: 'varchar', length: 100 })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
    lastName: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF })
    role: UserRole;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}