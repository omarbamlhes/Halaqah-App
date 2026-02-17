import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeController } from './badge.controller';
import { BadgeService } from './badge.service';
import { Recitation, Evaluation, MemorizationProgress, Attendance, Session } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Recitation, Evaluation, MemorizationProgress, Attendance, Session])],
  controllers: [BadgeController],
  providers: [BadgeService],
})
export class BadgeModule {}
