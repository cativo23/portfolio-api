import { BaseEntity } from '@core/entities/base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';

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
  // No DB-level default: MySQL/MariaDB can't apply DEFAULT to a TEXT
  // (simple-array) column, so the default is assigned in app code below.
  @Column({ type: 'simple-array' })
  roles: Role[];

  @BeforeInsert()
  assignDefaultRoles(): void {
    if (!this.roles || this.roles.length === 0) {
      this.roles = [ROLES.USER];
    }
  }
}
