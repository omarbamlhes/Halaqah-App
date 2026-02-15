import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SessionStatus } from '../../entities';

export class UpdateSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
