import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Permission } from '../../../utils/enums.js';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({
        type: 'enum',
        enum: Permission,
        array: true,
        default: [],
    })
    permissions: Permission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}