import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentChild, User, UserRole, MemorizationProgress, Recitation } from '../entities';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(ParentChild) private parentChildRepo: Repository<ParentChild>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(MemorizationProgress) private progressRepo: Repository<MemorizationProgress>,
    @InjectRepository(Recitation) private recitationRepo: Repository<Recitation>,
  ) {}

  async addChild(parentId: number, email: string) {
    const student = await this.userRepo.findOne({ where: { email, role: UserRole.STUDENT } });
    if (!student) throw new NotFoundException('لا يوجد طالب بهذا البريد الإلكتروني');

    const existing = await this.parentChildRepo.findOne({ where: { parentId, studentId: student.id } });
    if (existing) throw new BadRequestException('هذا الطالب مرتبط بالفعل');

    const link = this.parentChildRepo.create({ parentId, studentId: student.id });
    await this.parentChildRepo.save(link);
    return { message: 'تم ربط الطالب بنجاح', student: { id: student.id, name: student.name, email: student.email } };
  }

  async removeChild(parentId: number, studentId: number) {
    const link = await this.parentChildRepo.findOne({ where: { parentId, studentId } });
    if (!link) throw new NotFoundException('الربط غير موجود');
    await this.parentChildRepo.remove(link);
    return { message: 'تم إلغاء الربط' };
  }

  async getChildren(parentId: number) {
    const links = await this.parentChildRepo.find({
      where: { parentId },
      relations: ['student'],
    });
    return links.map(l => ({
      id: l.student.id,
      name: l.student.name,
      email: l.student.email,
      linkedAt: l.linkedAt,
    }));
  }

  async getChildProgress(parentId: number, studentId: number) {
    const link = await this.parentChildRepo.findOne({ where: { parentId, studentId } });
    if (!link) throw new NotFoundException('هذا الطالب غير مرتبط بك');

    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('الطالب غير موجود');
    const progress = await this.progressRepo.find({
      where: { studentId },
      order: { surahNumber: 'ASC' },
    });
    const recentRecitations = await this.recitationRepo.find({
      where: { studentId },
      relations: ['session'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      student: { id: student.id, name: student.name },
      progress,
      recentRecitations,
    };
  }
}
