import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewAssignment } from '../entities';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { NotificationModule } from '../notification/notification.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewAssignment]),
    NotificationModule,
    PointsModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
