import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentChild, User, MemorizationProgress, Recitation } from '../entities';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ParentChild, User, MemorizationProgress, Recitation])],
  controllers: [ParentController],
  providers: [ParentService],
})
export class ParentModule {}
