import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HalaqahService } from './halaqah.service';
import { CreateHalaqahDto } from './dto/create-halaqah.dto';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../entities';

@Controller('halaqahs')
@UseGuards(AuthGuard('jwt'))
export class HalaqahController {
  constructor(private halaqahService: HalaqahService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  create(@Body() dto: CreateHalaqahDto, @Request() req) {
    return this.halaqahService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.halaqahService.findAll(req.user.id, req.user.role);
  }

  @Get('public')
  findAllPublic() {
    return this.halaqahService.findAllPublic();
  }

  @Get('teacher/students-overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  getTeacherStudentsOverview(@Request() req) {
    return this.halaqahService.getTeacherStudentsOverview(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.halaqahService.findOne(id);
  }

  @Post(':id/join')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  join(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.halaqahService.join(id, req.user.id);
  }

  @Delete(':id/leave')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  leave(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.halaqahService.leave(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.TEACHER)
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.halaqahService.delete(id, req.user.id);
  }
}
