import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('parent_children')
@Unique(['parentId', 'studentId'])
export class ParentChild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  parentId: number;

  @Column()
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @CreateDateColumn()
  linkedAt: Date;
}
