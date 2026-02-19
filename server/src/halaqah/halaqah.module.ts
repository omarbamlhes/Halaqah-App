import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Halaqah, HalaqahStudent, User } from '../entities';
import { HalaqahService } from './halaqah.service';
import { HalaqahController } from './halaqah.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Halaqah, HalaqahStudent, User]),
    NotificationModule,
  ],
  controllers: [HalaqahController],
  providers: [HalaqahService],
  exports: [HalaqahService],
})
export class HalaqahModule {}
