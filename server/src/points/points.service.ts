import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointTransaction, PointReason, HalaqahStudent } from '../entities';

const POINT_VALUES: Record<string, number> = {
  [PointReason.ATTENDANCE_PRESENT]: 10,
  [PointReason.ATTENDANCE_LATE]: 5,
  [PointReason.RECITATION_NEW]: 20,
  [PointReason.RECITATION_REVIEW]: 10,
  [PointReason.EVALUATION_GOOD]: 15,
  [PointReason.EVALUATION_PERFECT]: 30,
  [PointReason.SURAH_COMPLETED]: 50,
  [PointReason.BADGE_EARNED]: 25,
};

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction) private pointRepo: Repository<PointTransaction>,
    @InjectRepository(HalaqahStudent) private halaqahStudentRepo: Repository<HalaqahStudent>,
  ) {}

  async awardPoints(data: {
    studentId: number;
    reason: PointReason;
    referenceId?: number;
    referenceType?: string;
    description?: string;
    points?: number;
  }): Promise<PointTransaction | null> {
    // Prevent duplicate awards
    if (data.referenceId && data.referenceType) {
      const exists = await this.hasPointsForReference(data.reason, data.referenceId, data.referenceType);
      if (exists) return null;
    }

    const points = data.points ?? POINT_VALUES[data.reason] ?? 0;
    if (points === 0) return null;

    const tx = this.pointRepo.create({
      studentId: data.studentId,
      points,
      reason: data.reason,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      description: data.description,
    });
    return this.pointRepo.save(tx);
  }

  async deductPoints(data: {
    studentId: number;
    points: number;
    reason: PointReason;
    referenceId?: number;
    referenceType?: string;
    description?: string;
  }): Promise<PointTransaction> {
    const tx = this.pointRepo.create({
      studentId: data.studentId,
      points: -Math.abs(data.points),
      reason: data.reason,
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      description: data.description,
    });
    return this.pointRepo.save(tx);
  }

  async getTotalPoints(studentId: number): Promise<number> {
    const result = await this.pointRepo
      .createQueryBuilder('pt')
      .select('COALESCE(SUM(pt.points), 0)', 'total')
      .where('pt.studentId = :studentId', { studentId })
      .getRawOne();
    return parseInt(result.total);
  }

  async getHistory(studentId: number, page = 1, limit = 20) {
    const [items, total] = await this.pointRepo.findAndCount({
      where: { studentId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getLeaderboard(options: { halaqahId?: number; period?: string } = {}) {
    let query = this.pointRepo
      .createQueryBuilder('pt')
      .select('pt.studentId', 'studentId')
      .addSelect('u.name', 'studentName')
      .addSelect('SUM(pt.points)', 'totalPoints')
      .innerJoin('pt.student', 'u');

    if (options.halaqahId) {
      query = query
        .innerJoin(HalaqahStudent, 'hs', 'hs.studentId = pt.studentId AND hs.halaqahId = :halaqahId', { halaqahId: options.halaqahId });
    }

    if (options.period === 'weekly') {
      query = query.andWhere("pt.createdAt >= NOW() - INTERVAL '7 days'");
    } else if (options.period === 'monthly') {
      query = query.andWhere("pt.createdAt >= NOW() - INTERVAL '30 days'");
    }

    const results = await query
      .groupBy('pt.studentId')
      .addGroupBy('u.name')
      .orderBy('SUM(pt.points)', 'DESC')
      .limit(50)
      .getRawMany();

    return results.map((r, i) => ({
      rank: i + 1,
      studentId: parseInt(r.studentId),
      studentName: r.studentName,
      totalPoints: parseInt(r.totalPoints),
    }));
  }

  async hasPointsForReference(reason: PointReason, referenceId: number, referenceType: string): Promise<boolean> {
    const count = await this.pointRepo.count({
      where: { reason, referenceId, referenceType },
    });
    return count > 0;
  }

  async getRank(studentId: number): Promise<number> {
    const myPoints = await this.getTotalPoints(studentId);
    const result = await this.pointRepo
      .createQueryBuilder('pt')
      .select('pt.studentId')
      .addSelect('SUM(pt.points)', 'total')
      .groupBy('pt.studentId')
      .having('SUM(pt.points) > :myPoints', { myPoints })
      .getRawMany();
    return result.length + 1;
  }
}
