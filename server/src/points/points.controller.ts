import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';

@Controller('points')
@UseGuards(AuthGuard('jwt'))
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get('my')
  async getMyPoints(@Request() req) {
    const studentId = req.user.id;
    const [totalPoints, rank, history] = await Promise.all([
      this.pointsService.getTotalPoints(studentId),
      this.pointsService.getRank(studentId),
      this.pointsService.getHistory(studentId, 1, 5),
    ]);
    return { totalPoints, rank, recentTransactions: history.items };
  }

  @Get('history')
  async getHistory(@Request() req, @Query('page') page?: string) {
    return this.pointsService.getHistory(req.user.id, parseInt(page || '1'));
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('halaqahId') halaqahId?: string,
    @Query('period') period?: string,
  ) {
    return this.pointsService.getLeaderboard({
      halaqahId: halaqahId ? parseInt(halaqahId) : undefined,
      period: period || 'all',
    });
  }
}
