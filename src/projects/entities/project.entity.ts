import { BaseEntity } from 'src/entities/base.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('projects')
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

  @Column({ default: false })
  isFeatured: boolean;
}
