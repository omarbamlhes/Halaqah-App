import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward, RewardRedemption, RedemptionStatus, PointReason, NotificationType } from '../entities';
import { PointsService } from '../points/points.service';
import { NotificationService } from '../notification/notification.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
    @InjectRepository(RewardRedemption) private redemptionRepo: Repository<RewardRedemption>,
    private pointsService: PointsService,
    private notificationService: NotificationService,
  ) {}

  async createReward(dto: CreateRewardDto, teacherId: number) {
    const reward = this.rewardRepo.create({ ...dto, createdBy: teacherId });
    return this.rewardRepo.save(reward);
  }

  async updateReward(id: number, dto: Partial<CreateRewardDto>, teacherId: number) {
    const reward = await this.rewardRepo.findOne({ where: { id, createdBy: teacherId } });
    if (!reward) throw new NotFoundException('المكافأة غير موجودة');
    Object.assign(reward, dto);
    return this.rewardRepo.save(reward);
  }

  async deactivateReward(id: number, teacherId: number) {
    const reward = await this.rewardRepo.findOne({ where: { id, createdBy: teacherId } });
    if (!reward) throw new NotFoundException('المكافأة غير موجودة');
    reward.isActive = false;
    return this.rewardRepo.save(reward);
  }

  async getRewardsForStudent() {
    return this.rewardRepo.find({
      where: { isActive: true },
      order: { pointsCost: 'ASC' },
    });
  }

  async getRewardsForTeacher(teacherId: number) {
    return this.rewardRepo.find({
      where: { createdBy: teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async redeemReward(rewardId: number, studentId: number) {
    const reward = await this.rewardRepo.findOne({ where: { id: rewardId, isActive: true } });
    if (!reward) throw new NotFoundException('المكافأة غير متاحة');

    if (reward.quantity !== -1 && reward.quantity <= 0) {
      throw new BadRequestException('المكافأة نفدت');
    }

    const totalPoints = await this.pointsService.getTotalPoints(studentId);
    if (totalPoints < reward.pointsCost) {
      throw new BadRequestException('نقاطك غير كافية');
    }

    // Deduct points
    await this.pointsService.deductPoints({
      studentId,
      points: reward.pointsCost,
      reason: PointReason.REWARD_REDEEMED,
      referenceId: rewardId,
      referenceType: 'reward',
      description: `استبدال: ${reward.name}`,
    });

    // Decrease quantity if limited
    if (reward.quantity !== -1) {
      reward.quantity--;
      await this.rewardRepo.save(reward);
    }

    // Create redemption record
    const redemption = this.redemptionRepo.create({
      studentId,
      rewardId,
      pointsCost: reward.pointsCost,
      status: RedemptionStatus.PENDING,
    });
    const saved = await this.redemptionRepo.save(redemption);

    // Notify teacher
    await this.notificationService.create({
      userId: reward.createdBy,
      type: NotificationType.REWARD_REDEEMED,
      title: 'طلب استبدال مكافأة',
      message: `طالب قام باستبدال "${reward.name}"`,
      metadata: { redemptionId: saved.id, rewardId, studentId },
    });

    return saved;
  }

  async getStudentRedemptions(studentId: number) {
    return this.redemptionRepo.find({
      where: { studentId },
      relations: ['reward'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTeacherRedemptions(teacherId: number) {
    return this.redemptionRepo
      .createQueryBuilder('rr')
      .innerJoinAndSelect('rr.reward', 'r')
      .innerJoinAndSelect('rr.student', 'u')
      .where('r.createdBy = :teacherId', { teacherId })
      .orderBy('rr.createdAt', 'DESC')
      .getMany();
  }

  async updateRedemptionStatus(id: number, status: 'fulfilled' | 'cancelled', teacherId: number) {
    const redemption = await this.redemptionRepo.findOne({
      where: { id },
      relations: ['reward'],
    });
    if (!redemption) throw new NotFoundException('الطلب غير موجود');
    if (redemption.reward.createdBy !== teacherId) throw new ForbiddenException('غير مصرح');

    redemption.status = status === 'fulfilled' ? RedemptionStatus.FULFILLED : RedemptionStatus.CANCELLED;
    if (status === 'fulfilled') {
      redemption.fulfilledAt = new Date();
    }

    // If cancelled, refund points
    if (status === 'cancelled') {
      await this.pointsService.awardPoints({
        studentId: redemption.studentId,
        reason: PointReason.REWARD_REDEEMED,
        points: redemption.pointsCost,
        description: `استرجاع: ${redemption.reward.name}`,
      });
    }

    const saved = await this.redemptionRepo.save(redemption);

    // Notify student
    await this.notificationService.create({
      userId: redemption.studentId,
      type: NotificationType.REWARD_FULFILLED,
      title: status === 'fulfilled' ? 'تمت الموافقة على المكافأة' : 'تم رفض طلب المكافأة',
      message: status === 'fulfilled'
        ? `تمت الموافقة على "${redemption.reward.name}"`
        : `تم رفض طلب "${redemption.reward.name}" واسترجاع النقاط`,
      metadata: { redemptionId: id },
    });

    return saved;
  }
}
