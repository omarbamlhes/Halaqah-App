import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recitation, Evaluation, MemorizationProgress, ParentChild, NotificationType, PointReason, ChallengeType } from '../entities';
import { CreateRecitationDto } from './dto/create-recitation.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { ChatGateway } from '../chat/chat.gateway';
import { NotificationService } from '../notification/notification.service';
import { PointsService } from '../points/points.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class RecitationService {
  constructor(
    @InjectRepository(Recitation) private recitationRepo: Repository<Recitation>,
    @InjectRepository(Evaluation) private evaluationRepo: Repository<Evaluation>,
    @InjectRepository(MemorizationProgress) private progressRepo: Repository<MemorizationProgress>,
    @InjectRepository(ParentChild) private parentChildRepo: Repository<ParentChild>,
    private chatGateway: ChatGateway,
    private notificationService: NotificationService,
    private pointsService: PointsService,
    private challengeService: ChallengeService,
    private reviewService: ReviewService,
  ) {}

  async createRecitation(dto: CreateRecitationDto) {
    const recitation = this.recitationRepo.create(dto);
    const saved = await this.recitationRepo.save(recitation);

    // Award points for recitation
    const reason = saved.type === 'review' ? PointReason.RECITATION_REVIEW : PointReason.RECITATION_NEW;
    await this.pointsService.awardPoints({
      studentId: saved.studentId,
      reason,
      referenceId: saved.id,
      referenceType: 'recitation',
      description: reason === PointReason.RECITATION_NEW ? 'تسميع جديد' : 'مراجعة تسميع',
    });

    // Update challenge progress
    const challengeType = saved.type === 'review' ? ChallengeType.REVIEW_RECITATION : ChallengeType.NEW_RECITATION;
    await this.challengeService.updateProgress(saved.studentId, challengeType);

    // Auto-complete matching assignments
    await this.reviewService.autoComplete(saved.studentId, saved.surahNumber, saved.fromAyah, saved.toAyah);

    return saved;
  }

  async findBySession(sessionId: number) {
    return this.recitationRepo.find({
      where: { sessionId },
      relations: ['student', 'session', 'evaluation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number) {
    return this.recitationRepo.find({
      where: { studentId },
      relations: ['session', 'evaluation'],
      order: { createdAt: 'DESC' },
    });
  }

  async createEvaluation(dto: CreateEvaluationDto) {
    const recitation = await this.recitationRepo.findOne({ where: { id: dto.recitationId } });
    if (!recitation) throw new NotFoundException('التسميع غير موجود');

    const evaluation = this.evaluationRepo.create(dto);
    const saved = await this.evaluationRepo.save(evaluation);

    await this.updateProgress(recitation);

    this.chatGateway.emitToUser(recitation.studentId, 'evaluation:new', {
      recitationId: recitation.id,
      surahNumber: recitation.surahNumber,
      fromAyah: recitation.fromAyah,
      toAyah: recitation.toAyah,
      hifdh: saved.hifdh,
      tajweed: saved.tajweed,
      fluency: saved.fluency,
    });

    // Award points for evaluation quality
    if (saved.hifdh >= 9 && saved.tajweed >= 9 && saved.fluency >= 9) {
      await this.pointsService.awardPoints({
        studentId: recitation.studentId,
        reason: PointReason.EVALUATION_PERFECT,
        referenceId: saved.id,
        referenceType: 'evaluation',
        description: 'تقييم ممتاز',
      });
    } else if (saved.hifdh >= 8 && saved.tajweed >= 8 && saved.fluency >= 8) {
      await this.pointsService.awardPoints({
        studentId: recitation.studentId,
        reason: PointReason.EVALUATION_GOOD,
        referenceId: saved.id,
        referenceType: 'evaluation',
        description: 'تقييم جيد',
      });
    }

    // Update challenge for good score
    if (saved.hifdh >= 8 && saved.tajweed >= 8 && saved.fluency >= 8) {
      await this.challengeService.updateProgress(recitation.studentId, ChallengeType.GET_GOOD_SCORE);
    }

    // Create notification for student
    const avg = Math.round(((saved.hifdh + saved.tajweed + saved.fluency) / 3) * 10) / 10;
    await this.notificationService.create({
      userId: recitation.studentId,
      type: NotificationType.EVALUATION_RECEIVED,
      title: 'تقييم جديد',
      message: `حصلت على معدل ${avg}/10 في تسميعك`,
      metadata: {
        recitationId: recitation.id,
        surahNumber: recitation.surahNumber,
        fromAyah: recitation.fromAyah,
        toAyah: recitation.toAyah,
        hifdh: saved.hifdh,
        tajweed: saved.tajweed,
        fluency: saved.fluency,
      },
    });

    // Notify parents
    const parentLinks = await this.parentChildRepo.find({
      where: { studentId: recitation.studentId },
    });
    for (const link of parentLinks) {
      await this.notificationService.create({
        userId: link.parentId,
        type: NotificationType.CHILD_EVALUATION,
        title: 'تقييم جديد لابنك',
        message: `حصل ابنك على معدل ${avg}/10`,
        metadata: {
          studentId: recitation.studentId,
          recitationId: recitation.id,
          surahNumber: recitation.surahNumber,
          hifdh: saved.hifdh,
          tajweed: saved.tajweed,
          fluency: saved.fluency,
        },
      });
    }

    return saved;
  }

  async getEvaluation(recitationId: number) {
    return this.evaluationRepo.findOne({ where: { recitationId }, relations: ['recitation'] });
  }

  private async updateProgress(recitation: Recitation) {
    let progress = await this.progressRepo.findOne({
      where: { studentId: recitation.studentId, surahNumber: recitation.surahNumber },
    });

    const ayahsCount = recitation.toAyah - recitation.fromAyah + 1;
    const wasPreviouslyMemorized = progress?.status === 'memorized';

    if (!progress) {
      progress = this.progressRepo.create({
        studentId: recitation.studentId,
        surahNumber: recitation.surahNumber,
        memorizedAyahs: ayahsCount,
        totalAyahs: ayahsCount,
        status: 'in_progress',
      });
    } else {
      progress.memorizedAyahs = Math.max(progress.memorizedAyahs, recitation.toAyah);
      if (progress.memorizedAyahs >= progress.totalAyahs && progress.totalAyahs > 0) {
        progress.status = 'memorized';
      } else {
        progress.status = 'in_progress';
      }
    }

    await this.progressRepo.save(progress);

    // Award points for completing a surah
    if (progress.status === 'memorized' && !wasPreviouslyMemorized) {
      await this.pointsService.awardPoints({
        studentId: recitation.studentId,
        reason: PointReason.SURAH_COMPLETED,
        referenceId: recitation.surahNumber,
        referenceType: 'surah',
        description: `إتمام حفظ سورة`,
      });
    }
  }

  async getStudentProgress(studentId: number) {
    return this.progressRepo.find({
      where: { studentId },
      order: { surahNumber: 'ASC' },
    });
  }
}
