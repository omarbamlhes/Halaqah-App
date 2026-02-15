import { IsEmail, IsNotEmpty, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../entities';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
