import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Session } from './session.entity';

@Entity('recitations')
export class Recitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentId: number;

  @Column()
  sessionId: number;

  @Column()
  surahNumber: number;

  @Column()
  fromAyah: number;

  @Column()
  toAyah: number;

  @Column({ type: 'varchar', default: 'new' })
  type: string; // 'new' | 'review'

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Session)
  @JoinColumn({ name: 'sessionId' })
  session: Session;

  @CreateDateColumn()
  createdAt: Date;
}
