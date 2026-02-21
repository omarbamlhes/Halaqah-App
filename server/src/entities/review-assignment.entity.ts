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

  @Column({ type: 'varchar', default: 'review' })
  type: string; // 'new' | 'review'

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @Column({ nullable: true })
  assignedById: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Halaqah)
  @JoinColumn({ name: 'halaqahId' })
  halaqah: Halaqah;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedById' })
  assignedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
