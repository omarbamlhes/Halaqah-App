import { Controller, Post, Delete, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParentService } from './parent.service';

@Controller('parent')
@UseGuards(AuthGuard('jwt'))
export class ParentController {
  constructor(private parentService: ParentService) {}

  @Post('children')
  addChild(@Request() req, @Body('email') email: string) {
    return this.parentService.addChild(req.user.id, email);
  }

  @Delete('children/:studentId')
  removeChild(@Request() req, @Param('studentId') studentId: string) {
    return this.parentService.removeChild(req.user.id, parseInt(studentId));
  }

  @Get('children')
  getChildren(@Request() req) {
    return this.parentService.getChildren(req.user.id);
  }

  @Get('children/:studentId/progress')
  getChildProgress(@Request() req, @Param('studentId') studentId: string) {
    return this.parentService.getChildProgress(req.user.id, parseInt(studentId));
  }
}
