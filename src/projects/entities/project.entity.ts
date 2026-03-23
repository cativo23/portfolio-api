import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('projects')
@Index(['createdAt'])
export class Project extends BaseEntity {
  @Column()
  @Index()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  shortDescription: string;

  @Column({ nullable: true })
  liveUrl: string;

  @Column()
  repoUrl: string;

  @Index()
  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'json', nullable: true })
  techStack: string[];

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  heroImage: string;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ default: 'Completed' })
  status: string;
}
