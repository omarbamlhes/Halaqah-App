import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChallengeService } from './challenge.service';

@Controller('challenges')
@UseGuards(AuthGuard('jwt'))
export class ChallengeController {
  constructor(private challengeService: ChallengeService) {}

  @Get('today')
  getToday(@Request() req) {
    return this.challengeService.getTodayChallenges(req.user.id);
  }

  @Get('streak')
  getStreak(@Request() req) {
    return this.challengeService.getChallengeStreak(req.user.id);
  }
}
