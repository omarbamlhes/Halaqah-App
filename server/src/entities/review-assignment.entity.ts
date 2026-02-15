import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Halaqah } from './halaqah.entity';

@Entity('review_assignments')
export class ReviewAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  halaqahId: number;

  @Column()
  surahNumber: number;

  @Column({ default: 1 })
  fromAyah: number;

  @Column()
  toAyah: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: string; // 'pending' | 'completed'

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Halaqah)
  @JoinColumn({ name: 'halaqahId' })
  halaqah: Halaqah;

  @CreateDateColumn()
  createdAt: Date;
}
