import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Halaqah, HalaqahStudent, User } from '../entities';
import { CreateHalaqahDto } from './dto/create-halaqah.dto';

@Injectable()
export class HalaqahService {
  constructor(
    @InjectRepository(Halaqah) private halaqahRepo: Repository<Halaqah>,
    @InjectRepository(HalaqahStudent) private hsRepo: Repository<HalaqahStudent>,
    private dataSource: DataSource,
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

  async getTeacherStudentsOverview(teacherId: number) {
    const studentsStats = await this.dataSource.query(`
      SELECT
        u.id AS "studentId",
        u.name AS "studentName",
        u.email AS "studentEmail",
        h.id AS "halaqahId",
        h.name AS "halaqahName",
        COUNT(DISTINCT r.id)::int AS "totalRecitations",
        COUNT(DISTINCT e.id)::int AS "evaluatedRecitations",
        ROUND(AVG(e.hifdh)::numeric, 1) AS "avgHifdh",
        ROUND(AVG(e.tajweed)::numeric, 1) AS "avgTajweed",
        ROUND(AVG(e.fluency)::numeric, 1) AS "avgFluency",
        MAX(r."createdAt") AS "lastRecitationDate"
      FROM halaqahs h
        JOIN halaqah_students hs ON hs."halaqahId" = h.id
        JOIN users u ON u.id = hs."studentId"
        LEFT JOIN recitations r ON r."studentId" = u.id
        LEFT JOIN evaluations e ON e."recitationId" = r.id
      WHERE h."teacherId" = $1
      GROUP BY u.id, u.name, u.email, h.id, h.name
      ORDER BY u.name, h.name
    `, [teacherId]);

    const memorization = await this.dataSource.query(`
      SELECT
        mp."studentId",
        COUNT(*) FILTER (WHERE mp.status = 'memorized')::int AS "memorizedSurahs",
        COUNT(*) FILTER (WHERE mp.status = 'in_progress')::int AS "inProgressSurahs"
      FROM memorization_progress mp
        JOIN halaqah_students hs ON hs."studentId" = mp."studentId"
        JOIN halaqahs h ON h.id = hs."halaqahId"
      WHERE h."teacherId" = $1
      GROUP BY mp."studentId"
    `, [teacherId]);

    const memMap: Record<number, any> = {};
    memorization.forEach((m: any) => { memMap[m.studentId] = m; });

    return studentsStats.map((s: any) => {
      const mem = memMap[s.studentId] || { memorizedSurahs: 0, inProgressSurahs: 0 };
      return {
        ...s,
        avgHifdh: s.avgHifdh ? parseFloat(s.avgHifdh) : null,
        avgTajweed: s.avgTajweed ? parseFloat(s.avgTajweed) : null,
        avgFluency: s.avgFluency ? parseFloat(s.avgFluency) : null,
        memorizedSurahs: mem.memorizedSurahs,
        inProgressSurahs: mem.inProgressSurahs,
      };
    });
  }
}
