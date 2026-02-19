import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

export enum ChallengeType {
  ATTEND_SESSION = 'attend_session',
  NEW_RECITATION = 'new_recitation',
  REVIEW_RECITATION = 'review_recitation',
  GET_GOOD_SCORE = 'get_good_score',
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('daily_challenges')
@Unique(['studentId', 'date', 'challengeType'])
export class DailyChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'enum', enum: ChallengeType })
  challengeType: ChallengeType;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'int', default: 1 })
  targetValue: number;

  @Column({ type: 'int', default: 0 })
  currentValue: number;

  @Column('int')
  bonusPoints: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: ChallengeStatus, default: ChallengeStatus.ACTIVE })
  status: ChallengeStatus;
}
