import { IsNotEmpty, IsDateString, IsOptional, IsInt } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  halaqahId: number;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  notes?: string;
}
