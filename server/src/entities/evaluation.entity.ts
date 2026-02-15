import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Recitation } from './recitation.entity';

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  recitationId: number;

  @OneToOne(() => Recitation)
  @JoinColumn({ name: 'recitationId' })
  recitation: Recitation;

  @Column({ type: 'int' })
  hifdh: number; // 1-10

  @Column({ type: 'int' })
  tajweed: number; // 1-10

  @Column({ type: 'int' })
  fluency: number; // 1-10

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
