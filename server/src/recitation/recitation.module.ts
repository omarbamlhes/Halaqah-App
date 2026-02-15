import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recitation, Evaluation, MemorizationProgress } from '../entities';
import { RecitationService } from './recitation.service';
import { RecitationController } from './recitation.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recitation, Evaluation, MemorizationProgress]),
    ChatModule,
  ],
  controllers: [RecitationController],
  providers: [RecitationService],
  exports: [RecitationService],
})
export class RecitationModule {}
