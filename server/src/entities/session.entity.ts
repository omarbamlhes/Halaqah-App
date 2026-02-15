import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Halaqah } from './halaqah.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  halaqahId: number;

  @ManyToOne(() => Halaqah)
  @JoinColumn({ name: 'halaqahId' })
  halaqah: Halaqah;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
