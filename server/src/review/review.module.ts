import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewAssignment } from '../entities';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewAssignment])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
