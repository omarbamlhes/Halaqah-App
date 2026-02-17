import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BadgeService } from './badge.service';

@Controller('badges')
@UseGuards(AuthGuard('jwt'))
export class BadgeController {
  constructor(private badgeService: BadgeService) {}

  @Get('student/:studentId')
  getStudentBadges(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.badgeService.getStudentBadges(studentId);
  }
}
