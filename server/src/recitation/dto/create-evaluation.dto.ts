import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateEvaluationDto {
  @IsInt()
  recitationId: number;

  @IsInt()
  @Min(1)
  @Max(10)
  hifdh: number;

  @IsInt()
  @Min(1)
  @Max(10)
  tajweed: number;

  @IsInt()
  @Min(1)
  @Max(10)
  fluency: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
