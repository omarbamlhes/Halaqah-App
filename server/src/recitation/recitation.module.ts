import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recitation, Evaluation, MemorizationProgress, ParentChild } from '../entities';
import { RecitationService } from './recitation.service';
import { RecitationController } from './recitation.controller';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recitation, Evaluation, MemorizationProgress, ParentChild]),
    ChatModule,
    NotificationModule,
  ],
  controllers: [RecitationController],
  providers: [RecitationService],
  exports: [RecitationService],
})
export class RecitationModule {}
