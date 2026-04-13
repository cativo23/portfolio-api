import { BaseEntity } from '@core/entities/base.entity';
import { Entity, Column, Index } from 'typeorm';
import { ProjectStatus } from '@projects/types/project-status';

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  heroImage: string;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @Index()
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.COMPLETED,
  })
  status: ProjectStatus;
}
