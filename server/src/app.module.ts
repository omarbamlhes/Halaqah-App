import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { HalaqahModule } from './halaqah/halaqah.module';
import { SessionModule } from './session/session.module';
import { RecitationModule } from './recitation/recitation.module';
import { ReviewModule } from './review/review.module';
import { ChatModule } from './chat/chat.module';
import { ParentModule } from './parent/parent.module';
import { BadgeModule } from './badge/badge.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'halaqah',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    HalaqahModule,
    SessionModule,
    RecitationModule,
    ReviewModule,
    ChatModule,
    ParentModule,
    BadgeModule,
  ],
})
export class AppModule {}
