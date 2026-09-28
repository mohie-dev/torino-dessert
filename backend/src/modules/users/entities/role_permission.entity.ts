import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';

import { Permission } from './permission.entity.js';
import { Role } from './role.entity.js';

@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'role_id',
        type: 'uuid',
    })
    roleId: string;

    @ManyToOne(
        () => Role,
        (role) => role.rolePermissions,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({
        name: 'permission_id',
        type: 'uuid',
    })
    permissionId: string;

    @ManyToOne(
        () => Permission,
        (permission) => permission.rolePermissions,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'permission_id' })
    permission: Permission;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}