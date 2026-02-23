import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PointsService } from '../points/points.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class DashboardService {
  constructor(
    private dataSource: DataSource,
    private pointsService: PointsService,
    private challengeService: ChallengeService,
    private reviewService: ReviewService,
  ) {}

  async getDashboard(userId: number, role: string) {
    switch (role) {
      case 'teacher':
        return this.getTeacherDashboard(userId);
      case 'student':
        return this.getStudentDashboard(userId);
      case 'parent':
        return this.getParentDashboard(userId);
      default:
        return {};
    }
  }

  private async getTeacherDashboard(teacherId: number) {
    const stats = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT h.id)::int AS "halaqahCount",
        COUNT(DISTINCT hs."studentId")::int AS "studentCount",
        COUNT(DISTINCT s.id)::int AS "sessionCount",
        COUNT(DISTINCT e.id)::int AS "evaluationCount"
      FROM halaqahs h
        LEFT JOIN halaqah_students hs ON hs."halaqahId" = h.id
        LEFT JOIN sessions s ON s."halaqahId" = h.id
        LEFT JOIN recitations r ON r."sessionId" = s.id
        LEFT JOIN evaluations e ON e."recitationId" = r.id
      WHERE h."teacherId" = $1
    `, [teacherId]);

    const attendanceRate = await this.dataSource.query(`
      SELECT
        CASE WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE a.status IN ('present', 'late'))::numeric / COUNT(*)::numeric) * 100
        ) END AS rate
      FROM attendance a
        JOIN sessions s ON s.id = a."sessionId"
        JOIN halaqahs h ON h.id = s."halaqahId"
      WHERE h."teacherId" = $1
    `, [teacherId]);

    const recentSessions = await this.dataSource.query(`
      SELECT s.id, s."scheduledAt", s.status, s.notes, h.name AS "halaqahName", h.id AS "halaqahId"
      FROM sessions s
        JOIN halaqahs h ON h.id = s."halaqahId"
      WHERE h."teacherId" = $1
      ORDER BY s."scheduledAt" DESC
      LIMIT 5
    `, [teacherId]);

    const recentEvaluations = await this.dataSource.query(`
      SELECT e.id, e.hifdh, e.tajweed, e.fluency, e."createdAt",
             r."surahNumber", r."fromAyah", r."toAyah",
             u.name AS "studentName"
      FROM evaluations e
        JOIN recitations r ON r.id = e."recitationId"
        JOIN users u ON u.id = r."studentId"
        JOIN sessions s ON s.id = r."sessionId"
        JOIN halaqahs h ON h.id = s."halaqahId"
      WHERE h."teacherId" = $1
      ORDER BY e."createdAt" DESC
      LIMIT 5
    `, [teacherId]);

    const halaqahSummaries = await this.dataSource.query(`
      SELECT
        h.id, h.name,
        COUNT(DISTINCT hs."studentId")::int AS "studentCount",
        COUNT(DISTINCT s.id)::int AS "sessionCount",
        MAX(s."scheduledAt") AS "lastSession"
      FROM halaqahs h
        LEFT JOIN halaqah_students hs ON hs."halaqahId" = h.id
        LEFT JOIN sessions s ON s."halaqahId" = h.id
      WHERE h."teacherId" = $1
      GROUP BY h.id, h.name
      ORDER BY h.name
    `, [teacherId]);

    const overdueAssignments = await this.reviewService.getTeacherOverdueCount(teacherId);

    return {
      role: 'teacher',
      ...stats[0],
      attendanceRate: parseInt(attendanceRate[0]?.rate || '0'),
      recentSessions,
      recentEvaluations,
      halaqahSummaries,
      overdueAssignments,
    };
  }

  private async getStudentDashboard(studentId: number) {
    const stats = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT hs."halaqahId")::int AS "halaqahCount",
        COUNT(DISTINCT r.id)::int AS "recitationCount",
        COUNT(DISTINCT mp."surahNumber") FILTER (WHERE mp.status = 'memorized')::int AS "memorizedSurahs",
        CASE WHEN COUNT(e.id) = 0 THEN 0
        ELSE ROUND(((AVG(e.hifdh) + AVG(e.tajweed) + AVG(e.fluency)) / 3)::numeric, 1) END AS "averageScore"
      FROM users u
        LEFT JOIN halaqah_students hs ON hs."studentId" = u.id
        LEFT JOIN recitations r ON r."studentId" = u.id
        LEFT JOIN evaluations e ON e."recitationId" = r.id
        LEFT JOIN memorization_progress mp ON mp."studentId" = u.id
      WHERE u.id = $1
    `, [studentId]);

    const attendanceRate = await this.dataSource.query(`
      SELECT
        CASE WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE a.status IN ('present', 'late'))::numeric / COUNT(*)::numeric) * 100
        ) END AS rate
      FROM attendance a
      WHERE a."studentId" = $1
    `, [studentId]);

    const recentEvaluations = await this.dataSource.query(`
      SELECT e.id, e.hifdh, e.tajweed, e.fluency, e.notes, e."createdAt",
             r."surahNumber", r."fromAyah", r."toAyah", r.type
      FROM evaluations e
        JOIN recitations r ON r.id = e."recitationId"
      WHERE r."studentId" = $1
      ORDER BY e."createdAt" DESC
      LIMIT 5
    `, [studentId]);

    // Streak calculation
    const recitationDays = await this.dataSource.query(`
      SELECT DISTINCT DATE(r."createdAt") AS day
      FROM recitations r
      WHERE r."studentId" = $1
      ORDER BY day DESC
    `, [studentId]);

    let currentStreak = 0;
    if (recitationDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);
      const firstDay = new Date(recitationDays[0].day);
      firstDay.setHours(0, 0, 0, 0);

      // Allow today or yesterday as the start
      if (firstDay.getTime() !== checkDate.getTime()) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (firstDay.getTime() !== checkDate.getTime()) {
          currentStreak = 0;
        }
      }

      if (firstDay.getTime() === checkDate.getTime() || firstDay.getTime() === today.getTime()) {
        currentStreak = 1;
        let prevDate = new Date(firstDay);
        for (let i = 1; i < recitationDays.length; i++) {
          const d = new Date(recitationDays[i].day);
          d.setHours(0, 0, 0, 0);
          prevDate.setDate(prevDate.getDate() - 1);
          if (d.getTime() === prevDate.getTime()) {
            currentStreak++;
            prevDate = new Date(d);
          } else {
            break;
          }
        }
      }
    }

    const [totalPoints, rank, challengeData, pendingAssignments, overdueAssignments, upcomingAssignments] = await Promise.all([
      this.pointsService.getTotalPoints(studentId),
      this.pointsService.getRank(studentId),
      this.challengeService.getTodayChallenges(studentId),
      this.reviewService.getPendingCount(studentId),
      this.reviewService.getOverdueCount(studentId),
      this.reviewService.getUpcoming(studentId, 3),
    ]);

    return {
      role: 'student',
      ...stats[0],
      averageScore: stats[0]?.averageScore ? parseFloat(stats[0].averageScore) : 0,
      attendanceRate: parseInt(attendanceRate[0]?.rate || '0'),
      currentStreak,
      recentEvaluations,
      totalPoints,
      rank,
      todayChallenges: challengeData.challenges,
      challengeStreak: challengeData.streak,
      pendingAssignments,
      overdueAssignments,
      upcomingAssignments,
    };
  }

  async getChartData(userId: number, role: string) {
    switch (role) {
      case 'teacher':
        return this.getTeacherCharts(userId);
      case 'student':
        return this.getStudentCharts(userId);
      case 'parent':
        return this.getParentCharts(userId);
      default:
        return {};
    }
  }

  private async getStudentCharts(studentId: number) {
    // 1. Surah distribution (Donut)
    const statusCounts = await this.dataSource.query(`
      SELECT status, COUNT(*)::int AS count
      FROM memorization_progress
      WHERE "studentId" = $1
      GROUP BY status
    `, [studentId]);

    const statusMap: Record<string, number> = {};
    let tracked = 0;
    for (const row of statusCounts) {
      statusMap[row.status] = row.count;
      tracked += row.count;
    }
    const surahDistribution = [
      { name: 'محفوظة', value: statusMap['memorized'] || 0, key: 'memorized' },
      { name: 'قيد الحفظ', value: statusMap['in_progress'] || 0, key: 'in_progress' },
      { name: 'للمراجعة', value: statusMap['needs_review'] || 0, key: 'needs_review' },
      { name: 'لم تبدأ', value: 114 - tracked, key: 'not_started' },
    ];

    // 2. Scores trend (Line - last 8 weeks)
    const scoresTrend = await this.dataSource.query(`
      SELECT
        DATE_TRUNC('week', e."createdAt")::date AS week,
        ROUND(AVG(e.hifdh)::numeric, 1) AS hifdh,
        ROUND(AVG(e.tajweed)::numeric, 1) AS tajweed,
        ROUND(AVG(e.fluency)::numeric, 1) AS fluency
      FROM evaluations e
        JOIN recitations r ON r.id = e."recitationId"
      WHERE r."studentId" = $1
        AND e."createdAt" >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', e."createdAt")
      ORDER BY week
    `, [studentId]);

    // 3. Weekly points (Bar - last 8 weeks)
    const weeklyPoints = await this.dataSource.query(`
      SELECT
        DATE_TRUNC('week', "createdAt")::date AS week,
        SUM(points)::int AS points
      FROM point_transactions
      WHERE "studentId" = $1
        AND "createdAt" >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY week
    `, [studentId]);

    const formatWeek = (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
    };

    return {
      surahDistribution,
      scoresTrend: scoresTrend.map((r: any) => ({
        week: r.week,
        label: formatWeek(r.week),
        hifdh: parseFloat(r.hifdh),
        tajweed: parseFloat(r.tajweed),
        fluency: parseFloat(r.fluency),
      })),
      weeklyPoints: weeklyPoints.map((r: any) => ({
        week: r.week,
        label: formatWeek(r.week),
        points: r.points,
      })),
    };
  }

  private async getTeacherCharts(teacherId: number) {
    // 1. Attendance breakdown per student (Stacked Bar)
    const attendanceBreakdown = await this.dataSource.query(`
      SELECT
        u.name,
        COUNT(*) FILTER (WHERE a.status = 'present')::int AS present,
        COUNT(*) FILTER (WHERE a.status = 'absent')::int AS absent,
        COUNT(*) FILTER (WHERE a.status = 'late')::int AS late,
        COUNT(*) FILTER (WHERE a.status = 'excused')::int AS excused
      FROM attendance a
        JOIN users u ON u.id = a."studentId"
        JOIN sessions s ON s.id = a."sessionId"
        JOIN halaqahs h ON h.id = s."halaqahId"
      WHERE h."teacherId" = $1
      GROUP BY u.id, u.name
      ORDER BY u.name
      LIMIT 20
    `, [teacherId]);

    // 2. Weekly scores trend (Line - last 8 weeks across all students)
    const scoresTrend = await this.dataSource.query(`
      SELECT
        DATE_TRUNC('week', e."createdAt")::date AS week,
        ROUND(AVG(e.hifdh)::numeric, 1) AS hifdh,
        ROUND(AVG(e.tajweed)::numeric, 1) AS tajweed,
        ROUND(AVG(e.fluency)::numeric, 1) AS fluency
      FROM evaluations e
        JOIN recitations r ON r.id = e."recitationId"
        JOIN sessions s ON s.id = r."sessionId"
        JOIN halaqahs h ON h.id = s."halaqahId"
      WHERE h."teacherId" = $1
        AND e."createdAt" >= NOW() - INTERVAL '8 weeks'
      GROUP BY DATE_TRUNC('week', e."createdAt")
      ORDER BY week
    `, [teacherId]);

    // 3. Students per halaqah (Donut)
    const studentsPerHalaqah = await this.dataSource.query(`
      SELECT h.name, COUNT(hs."studentId")::int AS value
      FROM halaqahs h
        LEFT JOIN halaqah_students hs ON hs."halaqahId" = h.id
      WHERE h."teacherId" = $1
      GROUP BY h.id, h.name
      ORDER BY h.name
    `, [teacherId]);

    const formatWeek = (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString('ar', { day: 'numeric', month: 'short' });
    };

    return {
      attendanceBreakdown,
      scoresTrend: scoresTrend.map((r: any) => ({
        week: r.week,
        label: formatWeek(r.week),
        hifdh: parseFloat(r.hifdh),
        tajweed: parseFloat(r.tajweed),
        fluency: parseFloat(r.fluency),
      })),
      studentsPerHalaqah,
    };
  }

  private async getParentCharts(parentId: number) {
    const children = await this.dataSource.query(`
      SELECT
        u.id, u.name,
        COUNT(DISTINCT mp."surahNumber") FILTER (WHERE mp.status = 'memorized')::int AS "memorizedSurahs",
        CASE WHEN COUNT(e.id) = 0 THEN 0
        ELSE ROUND(((AVG(e.hifdh) + AVG(e.tajweed) + AVG(e.fluency)) / 3)::numeric, 1) END AS "averageScore"
      FROM parent_children pc
        JOIN users u ON u.id = pc."studentId"
        LEFT JOIN memorization_progress mp ON mp."studentId" = u.id
        LEFT JOIN recitations r ON r."studentId" = u.id
        LEFT JOIN evaluations e ON e."recitationId" = r.id
      WHERE pc."parentId" = $1
      GROUP BY u.id, u.name
    `, [parentId]);

    const childrenComparison: any[] = [];
    for (const child of children) {
      const att = await this.dataSource.query(`
        SELECT
          CASE WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE a.status IN ('present', 'late'))::numeric / COUNT(*)::numeric) * 100
          ) END AS rate
        FROM attendance a
        WHERE a."studentId" = $1
      `, [child.id]);
      childrenComparison.push({
        name: child.name,
        memorizedSurahs: child.memorizedSurahs,
        averageScore: child.averageScore ? parseFloat(child.averageScore) : 0,
        attendanceRate: parseInt(att[0]?.rate || '0'),
      });
    }

    return { childrenComparison };
  }

  private async getParentDashboard(parentId: number) {
    const children = await this.dataSource.query(`
      SELECT
        u.id, u.name, u.email,
        COUNT(DISTINCT mp."surahNumber") FILTER (WHERE mp.status = 'memorized')::int AS "memorizedSurahs",
        COUNT(DISTINCT r.id)::int AS "totalRecitations",
        CASE WHEN COUNT(e.id) = 0 THEN 0
        ELSE ROUND(((AVG(e.hifdh) + AVG(e.tajweed) + AVG(e.fluency)) / 3)::numeric, 1) END AS "averageScore"
      FROM parent_children pc
        JOIN users u ON u.id = pc."studentId"
        LEFT JOIN memorization_progress mp ON mp."studentId" = u.id
        LEFT JOIN recitations r ON r."studentId" = u.id
        LEFT JOIN evaluations e ON e."recitationId" = r.id
      WHERE pc."parentId" = $1
      GROUP BY u.id, u.name, u.email
    `, [parentId]);

    // Get attendance for each child
    for (const child of children) {
      const att = await this.dataSource.query(`
        SELECT
          CASE WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE a.status IN ('present', 'late'))::numeric / COUNT(*)::numeric) * 100
          ) END AS rate
        FROM attendance a
        WHERE a."studentId" = $1
      `, [child.id]);
      child.attendanceRate = parseInt(att[0]?.rate || '0');
      child.averageScore = child.averageScore ? parseFloat(child.averageScore) : 0;
    }

    return {
      role: 'parent',
      children,
    };
  }
}
