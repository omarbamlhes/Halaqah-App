import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PointsModule } from '../points/points.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [PointsModule, ChallengeModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
