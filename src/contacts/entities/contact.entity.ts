import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column } from 'typeorm';

/**
 * Contact entity representing a contact form submission
 */
@Entity('contacts')
export class Contact extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  readAt?: Date;
}
