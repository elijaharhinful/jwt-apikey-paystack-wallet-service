import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Unnamed Key' })
  name: string;

  @Column()
  key_hash: string;

  @Column()
  preview_chars: string;

  @Column('simple-array')
  permissions: string[]; // e.g., ['deposit', 'transfer', 'read']

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.api_keys)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ default: false })
  is_revoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date;
}
