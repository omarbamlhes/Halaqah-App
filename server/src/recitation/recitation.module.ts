import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recitation, Evaluation, MemorizationProgress, ParentChild } from '../entities';
import { RecitationService } from './recitation.service';
import { RecitationController } from './recitation.controller';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';
import { PointsModule } from '../points/points.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recitation, Evaluation, MemorizationProgress, ParentChild]),
    ChatModule,
    NotificationModule,
    PointsModule,
    ChallengeModule,
  ],
  controllers: [RecitationController],
  providers: [RecitationService],
  exports: [RecitationService],
})
export class RecitationModule {}
