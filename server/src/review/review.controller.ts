import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  create(@Body() dto: CreateReviewDto, @Req() req) {
    dto.assignedById = req.user.id;
    return this.reviewService.create(dto);
  }

  @Post('bulk')
  bulkCreate(@Body() body: { assignments: CreateReviewDto[] }, @Req() req) {
    return this.reviewService.bulkCreate(body.assignments, req.user.id);
  }

  @Get('my')
  findMyAssignments(@Req() req, @Query('status') status?: string) {
    if (status === 'pending') {
      return this.reviewService.findPendingByStudent(req.user.id);
    }
    return this.reviewService.findByStudent(req.user.id);
  }

  @Get('overview/:halaqahId')
  getOverview(@Param('halaqahId', ParseIntPipe) halaqahId: number) {
    return this.reviewService.getOverview(halaqahId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.reviewService.findByStudent(studentId);
  }

  @Get('halaqah/:halaqahId')
  findByHalaqah(@Param('halaqahId', ParseIntPipe) halaqahId: number) {
    return this.reviewService.findByHalaqah(halaqahId);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.complete(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewService.remove(id);
  }
}
