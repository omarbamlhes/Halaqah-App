import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, Attendance, HalaqahStudent, Halaqah, NotificationType } from '../entities';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AttendanceRecordDto } from './dto/save-attendance.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(HalaqahStudent) private halaqahStudentRepo: Repository<HalaqahStudent>,
    @InjectRepository(Halaqah) private halaqahRepo: Repository<Halaqah>,
    private notificationService: NotificationService,
  ) {}

  async create(dto: CreateSessionDto) {
    const session = this.sessionRepo.create(dto);
    const saved = await this.sessionRepo.save(session);

    // Notify all students in the halaqah
    const halaqah = await this.halaqahRepo.findOne({ where: { id: dto.halaqahId } });
    const students = await this.halaqahStudentRepo.find({ where: { halaqahId: dto.halaqahId } });
    const date = new Date(dto.scheduledAt).toLocaleDateString('ar');
    for (const hs of students) {
      await this.notificationService.create({
        userId: hs.studentId,
        type: NotificationType.SESSION_CREATED,
        title: 'جلسة جديدة',
        message: `تم إنشاء جلسة جديدة في حلقة "${halaqah?.name}" بتاريخ ${date}`,
        metadata: { sessionId: saved.id, halaqahId: dto.halaqahId },
      });
    }

    return saved;
  }

  async findByHalaqah(halaqahId: number) {
    return this.sessionRepo.find({
      where: { halaqahId },
      order: { scheduledAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const session = await this.sessionRepo.findOne({ where: { id }, relations: ['halaqah'] });
    if (!session) throw new NotFoundException('الجلسة غير موجودة');
    return session;
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.findOne(id);
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async delete(id: number) {
    const session = await this.findOne(id);
    await this.sessionRepo.remove(session);
    return { message: 'تم حذف الجلسة' };
  }

  async saveAttendance(sessionId: number, records: AttendanceRecordDto[]) {
    await this.findOne(sessionId);
    const entities = records.map(r => {
      const attendance = this.attendanceRepo.create({
        sessionId,
        studentId: r.studentId,
        status: r.status,
        notes: r.notes || undefined,
      });
      return attendance;
    });
    await this.attendanceRepo.upsert(entities, ['sessionId', 'studentId']);
    return this.getAttendance(sessionId);
  }

  async getAttendance(sessionId: number) {
    return this.attendanceRepo.find({
      where: { sessionId },
      relations: ['student'],
    });
  }

  async getAttendanceStats(halaqahId: number) {
    const students = await this.halaqahStudentRepo.find({
      where: { halaqahId },
      relations: ['student'],
    });

    const sessions = await this.sessionRepo.find({ where: { halaqahId } });
    const totalSessions = sessions.length;

    if (totalSessions === 0) {
      return students.map(hs => ({
        studentId: hs.studentId,
        studentName: hs.student.name,
        totalSessions: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0,
      }));
    }

    const sessionIds = sessions.map(s => s.id);

    const stats = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.studentId', 'studentId')
      .addSelect('COUNT(*)', 'totalRecords')
      .addSelect(`SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)`, 'present')
      .addSelect(`SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END)`, 'absent')
      .addSelect(`SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END)`, 'late')
      .addSelect(`SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END)`, 'excused')
      .where('a.sessionId IN (:...sessionIds)', { sessionIds })
      .groupBy('a.studentId')
      .getRawMany();

    const statsMap = new Map(stats.map(s => [parseInt(s.studentId), s]));

    return students.map(hs => {
      const s = statsMap.get(hs.studentId);
      const present = s ? parseInt(s.present) : 0;
      const late = s ? parseInt(s.late) : 0;
      const absent = s ? parseInt(s.absent) : 0;
      const excused = s ? parseInt(s.excused) : 0;
      const attended = present + late;
      const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
      return {
        studentId: hs.studentId,
        studentName: hs.student.name,
        totalSessions,
        present,
        absent,
        late,
        excused,
        attendanceRate,
      };
    });
  }
}
