import { IsInt, IsDateString } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  studentId: number;

  @IsInt()
  halaqahId: number;

  @IsInt()
  surahNumber: number;

  @IsInt()
  fromAyah: number;

  @IsInt()
  toAyah: number;

  @IsDateString()
  dueDate: string;
}
