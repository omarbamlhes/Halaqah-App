import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { ReviewAssignment, NotificationType, PointReason } from '../entities';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationService } from '../notification/notification.service';
import { PointsService } from '../points/points.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewAssignment) private reviewRepo: Repository<ReviewAssignment>,
    private notificationService: NotificationService,
    private pointsService: PointsService,
  ) {}

  async create(dto: CreateReviewDto) {
    const review = this.reviewRepo.create(dto);
    const saved = await this.reviewRepo.save(review);

    // Send notification to student
    await this.notificationService.create({
      userId: dto.studentId,
      type: NotificationType.REVIEW_ASSIGNED,
      title: 'واجب جديد',
      message: `تم تكليفك بـ${dto.type === 'new' ? 'حفظ' : 'مراجعة'} جديد — الموعد: ${dto.dueDate}`,
      metadata: { assignmentId: saved.id, surahNumber: dto.surahNumber, fromAyah: dto.fromAyah, toAyah: dto.toAyah },
    });

    return saved;
  }

  async bulkCreate(assignments: CreateReviewDto[], assignedById: number) {
    const results: ReviewAssignment[] = [];
    for (const dto of assignments) {
      dto.assignedById = assignedById;
      const saved = await this.create(dto);
      results.push(saved);
    }
    return results;
  }

  async findByStudent(studentId: number) {
    return this.reviewRepo.find({
      where: { studentId },
      relations: ['halaqah'],
      order: { dueDate: 'ASC' },
    });
  }

  async findPendingByStudent(studentId: number) {
    return this.reviewRepo.find({
      where: { studentId, status: 'pending' },
      relations: ['halaqah'],
      order: { dueDate: 'ASC' },
    });
  }

  async findByHalaqah(halaqahId: number) {
    return this.reviewRepo.find({
      where: { halaqahId },
      relations: ['student'],
      order: { dueDate: 'ASC' },
    });
  }

  async getOverview(halaqahId: number) {
    const all = await this.reviewRepo.find({
      where: { halaqahId },
      relations: ['student'],
    });

    const today = new Date().toISOString().split('T')[0];
    const studentMap: Record<number, { name: string; completed: number; pending: number; overdue: number }> = {};

    for (const a of all) {
      if (!studentMap[a.studentId]) {
        studentMap[a.studentId] = { name: a.student?.name || '', completed: 0, pending: 0, overdue: 0 };
      }
      if (a.status === 'completed') {
        studentMap[a.studentId].completed++;
      } else if (a.dueDate < today) {
        studentMap[a.studentId].overdue++;
      } else {
        studentMap[a.studentId].pending++;
      }
    }

    return Object.entries(studentMap).map(([id, data]) => ({ studentId: parseInt(id), ...data }));
  }

  async complete(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('الواجب غير موجود');
    if (review.status === 'completed') return review;

    review.status = 'completed';
    const saved = await this.reviewRepo.save(review);

    // Award points
    await this.pointsService.awardPoints({
      studentId: review.studentId,
      reason: PointReason.ASSIGNMENT_COMPLETED,
      referenceId: review.id,
      referenceType: 'assignment',
      description: 'إتمام واجب',
    });

    return saved;
  }

  async remove(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('الواجب غير موجود');
    await this.reviewRepo.remove(review);
    return { message: 'تم حذف الواجب' };
  }

  async autoComplete(studentId: number, surahNumber: number, fromAyah: number, toAyah: number) {
    // Find pending assignments that match or overlap with the recited range
    const pending = await this.reviewRepo.find({
      where: { studentId, surahNumber, status: 'pending' },
    });

    for (const assignment of pending) {
      // Check if recitation covers the assignment range
      if (fromAyah <= assignment.fromAyah && toAyah >= assignment.toAyah) {
        await this.complete(assignment.id);
      }
    }
  }

  async getPendingCount(studentId: number): Promise<number> {
    return this.reviewRepo.count({ where: { studentId, status: 'pending' } });
  }

  async getOverdueCount(studentId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    return this.reviewRepo.count({
      where: { studentId, status: 'pending', dueDate: LessThan(today) },
    });
  }

  async getUpcoming(studentId: number, limit = 3) {
    return this.reviewRepo.find({
      where: { studentId, status: 'pending' },
      relations: ['halaqah'],
      order: { dueDate: 'ASC' },
      take: limit,
    });
  }

  async getTeacherOverdueCount(teacherId: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const result = await this.reviewRepo
      .createQueryBuilder('ra')
      .innerJoin('halaqahs', 'h', 'h.id = ra.halaqahId')
      .where('h."teacherId" = :teacherId', { teacherId })
      .andWhere('ra.status = :status', { status: 'pending' })
      .andWhere('ra."dueDate" < :today', { today })
      .getCount();
    return result;
  }
}
