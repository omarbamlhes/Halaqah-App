import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  halaqahId: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column('int')
  pointsCost: number;

  @Column({ type: 'int', default: -1 })
  quantity: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}
