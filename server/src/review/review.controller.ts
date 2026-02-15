import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewService.create(dto);
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
}
