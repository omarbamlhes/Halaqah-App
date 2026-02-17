import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Session } from './session.entity';
import { User } from './user.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

@Entity('attendance')
@Unique(['sessionId', 'studentId'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'enum', enum: AttendanceStatus })
  status: AttendanceStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
