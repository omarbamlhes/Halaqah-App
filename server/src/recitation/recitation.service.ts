import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recitation, Evaluation, MemorizationProgress } from '../entities';
import { CreateRecitationDto } from './dto/create-recitation.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class RecitationService {
  constructor(
    @InjectRepository(Recitation) private recitationRepo: Repository<Recitation>,
    @InjectRepository(Evaluation) private evaluationRepo: Repository<Evaluation>,
    @InjectRepository(MemorizationProgress) private progressRepo: Repository<MemorizationProgress>,
    private chatGateway: ChatGateway,
  ) {}

  async createRecitation(dto: CreateRecitationDto) {
    const recitation = this.recitationRepo.create(dto);
    return this.recitationRepo.save(recitation);
  }

  async findBySession(sessionId: number) {
    return this.recitationRepo.find({
      where: { sessionId },
      relations: ['student', 'session', 'evaluation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number) {
    return this.recitationRepo.find({
      where: { studentId },
      relations: ['session', 'evaluation'],
      order: { createdAt: 'DESC' },
    });
  }

  async createEvaluation(dto: CreateEvaluationDto) {
    const recitation = await this.recitationRepo.findOne({ where: { id: dto.recitationId } });
    if (!recitation) throw new NotFoundException('التسميع غير موجود');

    const evaluation = this.evaluationRepo.create(dto);
    const saved = await this.evaluationRepo.save(evaluation);

    await this.updateProgress(recitation);

    this.chatGateway.emitToUser(recitation.studentId, 'evaluation:new', {
      recitationId: recitation.id,
      surahNumber: recitation.surahNumber,
      fromAyah: recitation.fromAyah,
      toAyah: recitation.toAyah,
      hifdh: saved.hifdh,
      tajweed: saved.tajweed,
      fluency: saved.fluency,
    });

    return saved;
  }

  async getEvaluation(recitationId: number) {
    return this.evaluationRepo.findOne({ where: { recitationId }, relations: ['recitation'] });
  }

  private async updateProgress(recitation: Recitation) {
    let progress = await this.progressRepo.findOne({
      where: { studentId: recitation.studentId, surahNumber: recitation.surahNumber },
    });

    const ayahsCount = recitation.toAyah - recitation.fromAyah + 1;

    if (!progress) {
      progress = this.progressRepo.create({
        studentId: recitation.studentId,
        surahNumber: recitation.surahNumber,
        memorizedAyahs: ayahsCount,
        totalAyahs: ayahsCount,
        status: 'in_progress',
      });
    } else {
      progress.memorizedAyahs = Math.max(progress.memorizedAyahs, recitation.toAyah);
      if (progress.memorizedAyahs >= progress.totalAyahs && progress.totalAyahs > 0) {
        progress.status = 'memorized';
      } else {
        progress.status = 'in_progress';
      }
    }

    await this.progressRepo.save(progress);
  }

  async getStudentProgress(studentId: number) {
    return this.progressRepo.find({
      where: { studentId },
      order: { surahNumber: 'ASC' },
    });
  }
}
