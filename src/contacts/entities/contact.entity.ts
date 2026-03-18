import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

/**
 * Contact entity representing a contact form submission
 */
@Entity('contacts')
@Index(['createdAt'])
export class Contact extends BaseEntity {
  @Column()
  name: string;

  @Index()
  @Column()
  email: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  subject?: string;

  @Index()
  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  readAt?: Date;
}
