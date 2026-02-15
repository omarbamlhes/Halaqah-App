import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  @Get()
  findByHalaqah(@Query('halaqahId', ParseIntPipe) halaqahId: number) {
    return this.sessionService.findByHalaqah(halaqahId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.delete(id);
  }
}
