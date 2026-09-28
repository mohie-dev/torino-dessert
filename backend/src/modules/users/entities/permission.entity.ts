import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}