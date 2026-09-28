import {
    Entity,
    Column,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { RolePermission } from './role_permission.entity.js';
import { User } from './user.entity.js';

@Entity('roles')
export class Role extends BaseEntity {
    @Column({ type: 'varchar', length: 50, unique: true, })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true, })
    description: string;

    @OneToMany(() => User, (user) => user.role,)
    users: User[];

    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role,)
    rolePermissions: RolePermission[];
}