import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecitationService } from './recitation.service';
import { CreateRecitationDto } from './dto/create-recitation.dto';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Controller('recitations')
@UseGuards(AuthGuard('jwt'))
export class RecitationController {
  constructor(private recitationService: RecitationService) {}

  @Post()
  create(@Body() dto: CreateRecitationDto) {
    return this.recitationService.createRecitation(dto);
  }

  @Get('session/:sessionId')
  findBySession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.recitationService.findBySession(sessionId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.recitationService.findByStudent(studentId);
  }

  @Post('evaluate')
  evaluate(@Body() dto: CreateEvaluationDto) {
    return this.recitationService.createEvaluation(dto);
  }

  @Get(':id/evaluation')
  getEvaluation(@Param('id', ParseIntPipe) id: number) {
    return this.recitationService.getEvaluation(id);
  }

  @Get('progress/:studentId')
  getProgress(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.recitationService.getStudentProgress(studentId);
  }
}
