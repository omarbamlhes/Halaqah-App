import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message, User } from '../entities';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  controllers: [ChatController],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
