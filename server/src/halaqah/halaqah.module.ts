import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Halaqah, HalaqahStudent } from '../entities';
import { HalaqahService } from './halaqah.service';
import { HalaqahController } from './halaqah.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Halaqah, HalaqahStudent])],
  controllers: [HalaqahController],
  providers: [HalaqahService],
  exports: [HalaqahService],
})
export class HalaqahModule {}
