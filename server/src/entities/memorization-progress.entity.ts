import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('memorization_progress')
@Unique(['studentId', 'surahNumber'])
export class MemorizationProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  surahNumber: number;

  @Column({ default: 0 })
  memorizedAyahs: number;

  @Column({ default: 0 })
  totalAyahs: number;

  @Column({ type: 'varchar', default: 'not_started' })
  status: string; // 'not_started' | 'in_progress' | 'memorized' | 'needs_review'

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @UpdateDateColumn()
  updatedAt: Date;
}
