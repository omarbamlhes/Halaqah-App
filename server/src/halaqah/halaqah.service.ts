import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Halaqah, HalaqahStudent, User } from '../entities';
import { CreateHalaqahDto } from './dto/create-halaqah.dto';

@Injectable()
export class HalaqahService {
  constructor(
    @InjectRepository(Halaqah) private halaqahRepo: Repository<Halaqah>,
    @InjectRepository(HalaqahStudent) private hsRepo: Repository<HalaqahStudent>,
  ) {}

  async create(dto: CreateHalaqahDto, teacherId: number) {
    const halaqah = this.halaqahRepo.create({ ...dto, teacherId });
    return this.halaqahRepo.save(halaqah);
  }

  async findAll(userId: number, role: string) {
    if (role === 'teacher') {
      return this.halaqahRepo.find({
        where: { teacherId: userId },
        relations: ['teacher'],
        order: { createdAt: 'DESC' },
      });
    }
    const enrollments = await this.hsRepo.find({
      where: { studentId: userId },
      relations: ['halaqah', 'halaqah.teacher'],
    });
    return enrollments.map(e => e.halaqah);
  }

  async findOne(id: number) {
    const halaqah = await this.halaqahRepo.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!halaqah) throw new NotFoundException('الحلقة غير موجودة');

    const students = await this.hsRepo.find({
      where: { halaqahId: id },
      relations: ['student'],
    });

    return {
      ...halaqah,
      students: students.map(s => {
        const { password, ...student } = s.student as any;
        return { ...student, joinedAt: s.joinedAt };
      }),
    };
  }

  async join(halaqahId: number, studentId: number) {
    const halaqah = await this.halaqahRepo.findOne({ where: { id: halaqahId } });
    if (!halaqah) throw new NotFoundException('الحلقة غير موجودة');

    const existing = await this.hsRepo.findOne({ where: { halaqahId, studentId } });
    if (existing) throw new ConflictException('أنت منضم بالفعل لهذه الحلقة');

    const enrollment = this.hsRepo.create({ halaqahId, studentId });
    await this.hsRepo.save(enrollment);
    return { message: 'تم الانضمام بنجاح' };
  }

  async leave(halaqahId: number, studentId: number) {
    const result = await this.hsRepo.delete({ halaqahId, studentId });
    if (result.affected === 0) throw new NotFoundException('لم يتم العثور على التسجيل');
    return { message: 'تم مغادرة الحلقة' };
  }

  async delete(id: number, teacherId: number) {
    const halaqah = await this.halaqahRepo.findOne({ where: { id } });
    if (!halaqah) throw new NotFoundException('الحلقة غير موجودة');
    if (halaqah.teacherId !== teacherId) throw new ForbiddenException('لا تملك صلاحية حذف هذه الحلقة');
    await this.halaqahRepo.remove(halaqah);
    return { message: 'تم حذف الحلقة' };
  }

  async findAllPublic() {
    return this.halaqahRepo.find({
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }
}
