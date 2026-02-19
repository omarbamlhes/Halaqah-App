import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Reward } from './reward.entity';

export enum RedemptionStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

@Entity('reward_redemptions')
export class RewardRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  rewardId: number;

  @ManyToOne(() => Reward)
  @JoinColumn({ name: 'rewardId' })
  reward: Reward;

  @Column('int')
  pointsCost: number;

  @Column({ type: 'enum', enum: RedemptionStatus, default: RedemptionStatus.PENDING })
  status: RedemptionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt: Date;
}
