import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    private chatGateway: ChatGateway,
  ) {}

  async create(data: {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.notifRepo.create(data);
    const saved = await this.notifRepo.save(notification);

    this.chatGateway.emitToUser(data.userId, 'notification:new', saved);

    return saved;
  }

  async findByUser(userId: number, page = 1, limit = 20) {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(id: number, userId: number) {
    await this.notifRepo.update({ id, userId }, { isRead: true });
    return { message: 'تم التعليم كمقروء' };
  }

  async markAllAsRead(userId: number) {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
    return { message: 'تم تعليم الكل كمقروء' };
  }

  async getUnreadCount(userId: number) {
    const count = await this.notifRepo.count({ where: { userId, isRead: false } });
    return { count };
  }
}
