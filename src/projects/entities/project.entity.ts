import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';

@Entity('projects')
@Index(['createdAt'])
export class Project extends BaseEntity {
  @Column()
  title: string;

  @Column()
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

  @Column({ type: 'simple-json', nullable: true })
  techStack: string[];
}
