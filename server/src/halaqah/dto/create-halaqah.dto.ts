import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateHalaqahDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;
}
