import { BaseEntity } from '@core/entities/base.entity';
import { Column, Entity } from 'typeorm';

export const ROLES = { ADMIN: 'admin', USER: 'user' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false, length: 500 })
  username: string;
  @Column({ unique: true, nullable: false })
  email: string;
  @Column({ nullable: false })
  password: string;
  @Column({ type: 'simple-array', default: ROLES.USER })
  roles: Role[];
}
