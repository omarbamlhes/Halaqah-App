import { IsInt, IsDateString, IsOptional, IsString, IsIn } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @IsIn(['new', 'review'])
  type?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  assignedById?: number;
}
