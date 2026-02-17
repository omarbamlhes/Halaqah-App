import { IsArray, ValidateNested, IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../entities';

export class AttendanceRecordDto {
  @IsInt()
  studentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SaveAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}
