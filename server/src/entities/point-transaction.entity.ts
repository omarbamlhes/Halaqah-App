import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum PointReason {
  ATTENDANCE_PRESENT = 'attendance_present',
  ATTENDANCE_LATE = 'attendance_late',
  RECITATION_NEW = 'recitation_new',
  RECITATION_REVIEW = 'recitation_review',
  EVALUATION_GOOD = 'evaluation_good',
  EVALUATION_PERFECT = 'evaluation_perfect',
  SURAH_COMPLETED = 'surah_completed',
  BADGE_EARNED = 'badge_earned',
  CHALLENGE_COMPLETED = 'challenge_completed',
  REWARD_REDEEMED = 'reward_redeemed',
}

@Entity('point_transactions')
@Index(['studentId', 'createdAt'])
export class PointTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column('int')
  points: number;

  @Column({ type: 'enum', enum: PointReason })
  reason: PointReason;

  @Column({ nullable: true })
  referenceId: number;

  @Column({ type: 'varchar', nullable: true })
  referenceType: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
