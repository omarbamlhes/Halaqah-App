import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';

@Controller('rewards')
@UseGuards(AuthGuard('jwt'))
export class RewardsController {
  constructor(private rewardsService: RewardsService) {}

  @Post()
  create(@Body() dto: CreateRewardDto, @Request() req) {
    return this.rewardsService.createReward(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRewardDto>, @Request() req) {
    return this.rewardsService.updateReward(parseInt(id), dto, req.user.id);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string, @Request() req) {
    return this.rewardsService.deactivateReward(parseInt(id), req.user.id);
  }

  @Get()
  getRewards(@Request() req) {
    if (req.user.role === 'teacher') {
      return this.rewardsService.getRewardsForTeacher(req.user.id);
    }
    return this.rewardsService.getRewardsForStudent();
  }

  @Post(':id/redeem')
  redeem(@Param('id') id: string, @Request() req) {
    return this.rewardsService.redeemReward(parseInt(id), req.user.id);
  }

  @Get('redemptions')
  getRedemptions(@Request() req) {
    if (req.user.role === 'teacher') {
      return this.rewardsService.getTeacherRedemptions(req.user.id);
    }
    return this.rewardsService.getStudentRedemptions(req.user.id);
  }

  @Patch('redemptions/:id')
  updateRedemption(
    @Param('id') id: string,
    @Body('status') status: 'fulfilled' | 'cancelled',
    @Request() req,
  ) {
    return this.rewardsService.updateRedemptionStatus(parseInt(id), status, req.user.id);
  }
}
