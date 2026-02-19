import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward, RewardRedemption } from '../entities';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { PointsModule } from '../points/points.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, RewardRedemption]),
    PointsModule,
    NotificationModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
