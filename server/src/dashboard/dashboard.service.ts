import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private dataSource: DataSource) {}

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

    return {
      role: 'teacher',
      ...stats[0],
      attendanceRate: parseInt(attendanceRate[0]?.rate || '0'),
      recentSessions,
      recentEvaluations,
      halaqahSummaries,
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

    return {
      role: 'student',
      ...stats[0],
      averageScore: stats[0]?.averageScore ? parseFloat(stats[0].averageScore) : 0,
      attendanceRate: parseInt(attendanceRate[0]?.rate || '0'),
      currentStreak,
      recentEvaluations,
    };
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
