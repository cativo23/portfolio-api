import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp' })
    readonly createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    readonly updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt!: Date;
}