import { BaseEntity } from 'src/entities/base.entity';
import { Column, Entity } from 'typeorm';
@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false, length: 500 })
  username: string;
  @Column({ unique: true, nullable: false })
  email: string;
  @Column({ nullable: false })
  password: string;
}
