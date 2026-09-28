import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '../../../utils/enums.js';
import { Permission } from './permission.entity.js';

@Entity('role_permissions')
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ name: 'permission_id', type: 'uuid' })
    permissionId: string;

    @ManyToOne(() => Permission)
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}