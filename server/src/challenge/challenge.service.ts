import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyChallenge, ChallengeType, ChallengeStatus, PointReason } from '../entities';
import { PointsService } from '../points/points.service';

const CHALLENGE_DEFINITIONS = [
  {
    type: ChallengeType.ATTEND_SESSION,
    description: 'احضر جلسة اليوم',
    targetValue: 1,
    bonusPoints: 15,
  },
  {
    type: ChallengeType.NEW_RECITATION,
    description: 'سجّل تسميعاً جديداً',
    targetValue: 1,
    bonusPoints: 20,
  },
  {
    type: ChallengeType.REVIEW_RECITATION,
    description: 'راجع تسميعاً سابقاً',
    targetValue: 1,
    bonusPoints: 15,
  },
  {
    type: ChallengeType.GET_GOOD_SCORE,
    description: 'احصل على تقييم ≥ 8',
    targetValue: 1,
    bonusPoints: 25,
  },
];

@Injectable()
export class ChallengeService {
  constructor(
    @InjectRepository(DailyChallenge) private challengeRepo: Repository<DailyChallenge>,
    private pointsService: PointsService,
  ) {}

  async getOrCreateDailyChallenges(studentId: number): Promise<DailyChallenge[]> {
    const today = new Date().toISOString().split('T')[0];

    // Expire old challenges
    await this.challengeRepo
      .createQueryBuilder()
      .update(DailyChallenge)
      .set({ status: ChallengeStatus.EXPIRED })
      .where('studentId = :studentId AND date < :today AND status = :active', {
        studentId, today, active: ChallengeStatus.ACTIVE,
      })
      .execute();

    // Check existing
    const existing = await this.challengeRepo.find({
      where: { studentId, date: today },
    });
    if (existing.length > 0) return existing;

    // Generate 2-3 random challenges
    const shuffled = [...CHALLENGE_DEFINITIONS].sort(() => Math.random() - 0.5);
    const count = Math.random() > 0.5 ? 3 : 2;
    const selected = shuffled.slice(0, count);

    const challenges = selected.map(def =>
      this.challengeRepo.create({
        studentId,
        challengeType: def.type,
        description: def.description,
        targetValue: def.targetValue,
        bonusPoints: def.bonusPoints,
        date: today,
        status: ChallengeStatus.ACTIVE,
      }),
    );

    return this.challengeRepo.save(challenges);
  }

  async updateProgress(studentId: number, type: ChallengeType, increment = 1) {
    const today = new Date().toISOString().split('T')[0];

    const challenge = await this.challengeRepo.findOne({
      where: { studentId, date: today, challengeType: type, status: ChallengeStatus.ACTIVE },
    });

    if (!challenge) return;

    challenge.currentValue = Math.min(challenge.currentValue + increment, challenge.targetValue);

    if (challenge.currentValue >= challenge.targetValue) {
      challenge.status = ChallengeStatus.COMPLETED;
      // Award bonus points
      await this.pointsService.awardPoints({
        studentId,
        reason: PointReason.CHALLENGE_COMPLETED,
        points: challenge.bonusPoints,
        referenceId: challenge.id,
        referenceType: 'challenge',
        description: `تحدي: ${challenge.description}`,
      });
    }

    await this.challengeRepo.save(challenge);
  }

  async getChallengeStreak(studentId: number): Promise<number> {
    const completedDays = await this.challengeRepo
      .createQueryBuilder('dc')
      .select('dc.date', 'day')
      .where('dc.studentId = :studentId', { studentId })
      .andWhere('dc.status = :status', { status: ChallengeStatus.COMPLETED })
      .groupBy('dc.date')
      .having('COUNT(*) = (SELECT COUNT(*) FROM daily_challenges dc2 WHERE dc2."studentId" = :studentId AND dc2.date = dc.date)')
      .orderBy('dc.date', 'DESC')
      .getRawMany();

    if (completedDays.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    for (const row of completedDays) {
      const day = new Date(row.day);
      day.setHours(0, 0, 0, 0);

      if (day.getTime() === checkDate.getTime() || (streak === 0 && day.getTime() === checkDate.getTime() - 86400000)) {
        streak++;
        checkDate = new Date(day);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async getTodayChallenges(studentId: number) {
    const challenges = await this.getOrCreateDailyChallenges(studentId);
    const streak = await this.getChallengeStreak(studentId);
    return { challenges, streak };
  }
}
