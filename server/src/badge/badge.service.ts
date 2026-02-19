import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recitation, Evaluation, MemorizationProgress, Attendance, Session, AttendanceStatus, StudentBadge, PointReason, NotificationType } from '../entities';
import { PointsService } from '../points/points.service';
import { NotificationService } from '../notification/notification.service';

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress: { current: number; target: number };
}

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Recitation) private recitationRepo: Repository<Recitation>,
    @InjectRepository(Evaluation) private evaluationRepo: Repository<Evaluation>,
    @InjectRepository(MemorizationProgress) private progressRepo: Repository<MemorizationProgress>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(StudentBadge) private studentBadgeRepo: Repository<StudentBadge>,
    private pointsService: PointsService,
    private notificationService: NotificationService,
  ) {}

  async getStudentBadges(studentId: number) {
    const [recitationCount, memorizedSurahs, attendanceData, excellentEval] = await Promise.all([
      this.recitationRepo.count({ where: { studentId } }),
      this.progressRepo.find({ where: { studentId, status: 'memorized' } }),
      this.getAttendanceData(studentId),
      this.hasExcellentEvaluation(studentId),
    ]);

    const totalMemorized = memorizedSurahs.length;
    const juzAmmaSurahs = memorizedSurahs.filter(s => s.surahNumber >= 78 && s.surahNumber <= 114);
    const juzAmmaCount = juzAmmaSurahs.length;

    const badges: Badge[] = [
      {
        id: 'first_recitation',
        name: 'أول تسميع',
        description: 'أتممت أول تسميع',
        earned: recitationCount >= 1,
        progress: { current: Math.min(recitationCount, 1), target: 1 },
      },
      {
        id: 'ten_recitations',
        name: '10 تسميعات',
        description: 'أتممت 10 تسميعات',
        earned: recitationCount >= 10,
        progress: { current: Math.min(recitationCount, 10), target: 10 },
      },
      {
        id: 'fifty_recitations',
        name: '50 تسميعات',
        description: 'أتممت 50 تسميعاً',
        earned: recitationCount >= 50,
        progress: { current: Math.min(recitationCount, 50), target: 50 },
      },
      {
        id: 'first_surah',
        name: 'أول سورة',
        description: 'حفظت سورة كاملة',
        earned: totalMemorized >= 1,
        progress: { current: Math.min(totalMemorized, 1), target: 1 },
      },
      {
        id: 'ten_surahs',
        name: '10 سور',
        description: 'حفظت 10 سور كاملة',
        earned: totalMemorized >= 10,
        progress: { current: Math.min(totalMemorized, 10), target: 10 },
      },
      {
        id: 'juz_amma',
        name: 'جزء عمّ',
        description: 'حفظت جزء عمّ كاملاً (37 سورة)',
        earned: juzAmmaCount >= 37,
        progress: { current: juzAmmaCount, target: 37 },
      },
      {
        id: 'perfect_attendance',
        name: 'حضور مثالي',
        description: 'حضور 100% (5 جلسات على الأقل)',
        earned: attendanceData.total >= 5 && attendanceData.presentCount === attendanceData.total,
        progress: { current: attendanceData.presentCount, target: Math.max(attendanceData.total, 5) },
      },
      {
        id: 'seven_day_streak',
        name: 'سلسلة 7 جلسات',
        description: 'حضرت 7 جلسات متتالية',
        earned: attendanceData.longest >= 7,
        progress: { current: Math.min(attendanceData.longest, 7), target: 7 },
      },
      {
        id: 'excellent_eval',
        name: 'تقييم ممتاز',
        description: 'حصلت على تقييم بمتوسط ≥9',
        earned: excellentEval,
        progress: { current: excellentEval ? 1 : 0, target: 1 },
      },
    ];

    const earnedBadges = badges.filter(b => b.earned).length;

    return {
      badges,
      streak: { current: attendanceData.current, longest: attendanceData.longest },
      stats: {
        totalRecitations: recitationCount,
        totalMemorized,
        attendanceRate: attendanceData.total > 0
          ? Math.round((attendanceData.presentCount / attendanceData.total) * 100)
          : 0,
        earnedBadges,
        totalBadges: badges.length,
      },
    };
  }

  async checkAndPersistBadges(studentId: number) {
    const { badges } = await this.getStudentBadges(studentId);
    const earnedBadges = badges.filter(b => b.earned);

    const existingBadges = await this.studentBadgeRepo.find({ where: { studentId } });
    const existingIds = new Set(existingBadges.map(b => b.badgeId));

    for (const badge of earnedBadges) {
      if (!existingIds.has(badge.id)) {
        await this.studentBadgeRepo.save(
          this.studentBadgeRepo.create({ studentId, badgeId: badge.id }),
        );
        await this.pointsService.awardPoints({
          studentId,
          reason: PointReason.BADGE_EARNED,
          referenceType: 'badge',
          description: `شارة: ${badge.name}`,
        });
        await this.notificationService.create({
          userId: studentId,
          type: NotificationType.BADGE_EARNED,
          title: 'شارة جديدة!',
          message: `حصلت على شارة "${badge.name}"`,
          metadata: { badgeId: badge.id },
        });
      }
    }
  }

  private async getAttendanceData(studentId: number) {
    const records = await this.attendanceRepo.find({
      where: { studentId },
      relations: ['session'],
      order: { session: { scheduledAt: 'ASC' } },
    });

    let current = 0;
    let longest = 0;
    let presentCount = 0;

    for (const record of records) {
      if (record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE) {
        current++;
        longest = Math.max(longest, current);
        presentCount++;
      } else {
        current = 0;
      }
    }

    return { current, longest, presentCount, total: records.length };
  }

  private async hasExcellentEvaluation(studentId: number): Promise<boolean> {
    const result = await this.evaluationRepo
      .createQueryBuilder('e')
      .innerJoin('e.recitation', 'r')
      .where('r.studentId = :studentId', { studentId })
      .andWhere('(e.hifdh + e.tajweed + e.fluency) / 3.0 >= 9')
      .getCount();

    return result > 0;
  }
}
