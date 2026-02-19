import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session, Attendance, HalaqahStudent, Halaqah } from '../entities';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, Attendance, HalaqahStudent, Halaqah]),
    NotificationModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
