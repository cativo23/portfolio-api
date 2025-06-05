import { BaseEntity } from '@core/entities/base.entity';
import {
  Entity,
  Column,
  Check,
  Index,
} from 'typeorm';

@Entity('projects')
@Check('CHK_project_urls', `"liveUrl" IS NULL OR "liveUrl" LIKE 'http%'`)
@Check('CHK_project_description', `LENGTH("description") >= 10`)
@Index('IDX_projects_title_is_featured', ['title', 'isFeatured']) // Composite index
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

  @Column({ default: false })
  @Index()
  isFeatured: boolean;
}
