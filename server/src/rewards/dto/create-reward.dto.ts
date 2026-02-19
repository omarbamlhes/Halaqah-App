import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  pointsCost: number;

  @IsOptional()
  @IsNumber()
  halaqahId?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
