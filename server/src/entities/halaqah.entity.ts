import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('halaqahs')
export class Halaqah {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  teacherId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @CreateDateColumn()
  createdAt: Date;
}
