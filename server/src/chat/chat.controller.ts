import { Controller, Get, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  @Get(':halaqahId')
  async getMessages(
    @Param('halaqahId', ParseIntPipe) halaqahId: number,
    @Query('limit') limit: number = 50,
  ) {
    const messages = await this.messageRepo.find({
      where: { halaqahId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: limit || 50,
    });
    return messages.map(m => ({
      ...m,
      sender: { id: m.sender.id, name: m.sender.name, role: m.sender.role },
    }));
  }
}
