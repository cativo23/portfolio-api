import { BaseEntity } from './base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
    @Index({ unique: true })
    @Column({ length: 255, nullable: false })
    key: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    description?: string;
}
