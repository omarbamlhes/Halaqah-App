import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashedPassword });
    await this.userRepo.save(user);

    const { password, ...result } = user;
    return {
      user: result,
      token: this.generateToken(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    const { password, ...result } = user;
    return {
      user: result,
      token: this.generateToken(user),
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('المستخدم غير موجود');
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, data: { name?: string }) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('المستخدم غير موجود');
    if (data.name) user.name = data.name;
    await this.userRepo.save(user);
    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('المستخدم غير موجود');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('كلمة المرور الحالية غير صحيحة');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);
    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  private generateToken(user: User) {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
