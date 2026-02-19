import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  EVALUATION_RECEIVED = 'evaluation_received',
  SESSION_CREATED = 'session_created',
  BADGE_EARNED = 'badge_earned',
  STUDENT_JOINED = 'student_joined',
  REVIEW_ASSIGNED = 'review_assigned',
  CHILD_EVALUATION = 'child_evaluation',
  POINTS_EARNED = 'points_earned',
  CHALLENGE_COMPLETED = 'challenge_completed',
  REWARD_REDEEMED = 'reward_redeemed',
  REWARD_FULFILLED = 'reward_fulfilled',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
