import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRecitationDto {
  @IsInt()
  studentId: number;

  @IsInt()
  sessionId: number;

  @IsInt()
  surahNumber: number;

  @IsInt()
  fromAyah: number;

  @IsInt()
  toAyah: number;

  @IsOptional()
  @IsString()
  type?: string;
}
