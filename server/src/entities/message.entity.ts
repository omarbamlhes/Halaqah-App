import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Halaqah } from './halaqah.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  halaqahId: number;

  @Column('text')
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => Halaqah)
  @JoinColumn({ name: 'halaqahId' })
  halaqah: Halaqah;

  @CreateDateColumn()
  createdAt: Date;
}
