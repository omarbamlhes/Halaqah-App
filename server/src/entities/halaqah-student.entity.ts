import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Halaqah } from './halaqah.entity';

@Entity('halaqah_students')
@Unique(['halaqahId', 'studentId'])
export class HalaqahStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  halaqahId: number;

  @Column()
  studentId: number;

  @ManyToOne(() => Halaqah)
  @JoinColumn({ name: 'halaqahId' })
  halaqah: Halaqah;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @CreateDateColumn()
  joinedAt: Date;
}
