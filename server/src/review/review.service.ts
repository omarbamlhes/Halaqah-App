import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewAssignment } from '../entities';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewAssignment) private reviewRepo: Repository<ReviewAssignment>,
  ) {}

  async create(dto: CreateReviewDto) {
    const review = this.reviewRepo.create(dto);
    return this.reviewRepo.save(review);
  }

  async findByStudent(studentId: number) {
    return this.reviewRepo.find({
      where: { studentId },
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

  async complete(id: number) {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('المراجعة غير موجودة');
    review.status = 'completed';
    return this.reviewRepo.save(review);
  }
}
