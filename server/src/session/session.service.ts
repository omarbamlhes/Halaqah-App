import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
  ) {}

  async create(dto: CreateSessionDto) {
    const session = this.sessionRepo.create(dto);
    return this.sessionRepo.save(session);
  }

  async findByHalaqah(halaqahId: number) {
    return this.sessionRepo.find({
      where: { halaqahId },
      order: { scheduledAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const session = await this.sessionRepo.findOne({ where: { id }, relations: ['halaqah'] });
    if (!session) throw new NotFoundException('الجلسة غير موجودة');
    return session;
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.findOne(id);
    Object.assign(session, dto);
    return this.sessionRepo.save(session);
  }

  async delete(id: number) {
    const session = await this.findOne(id);
    await this.sessionRepo.remove(session);
    return { message: 'تم حذف الجلسة' };
  }
}
