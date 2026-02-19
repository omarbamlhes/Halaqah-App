import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { Recitation, Evaluation, MemorizationProgress, Attendance, Session, StudentBadge } from '../entities';
import { PointsModule } from '../points/points.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recitation, Evaluation, MemorizationProgress, Attendance, Session, StudentBadge]),
    PointsModule,
    NotificationModule,
  ],
  controllers: [BadgeController],
  providers: [BadgeService],
  exports: [BadgeService],
})
export class BadgeModule {}
