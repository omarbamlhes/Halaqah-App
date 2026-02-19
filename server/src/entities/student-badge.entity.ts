import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('student_badges')
@Unique(['studentId', 'badgeId'])
export class StudentBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'varchar' })
  badgeId: string;

  @CreateDateColumn()
  earnedAt: Date;
}
