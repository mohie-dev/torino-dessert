import {
    Entity,
    Column,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { RolePermission } from './role_permission.entity.js';

@Entity('permissions')
export class Permission extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    code: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    description: string;

    @OneToMany(
        () => RolePermission,
        (rolePermission) => rolePermission.permission,
    )
    rolePermissions: RolePermission[];
}