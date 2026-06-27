import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@app/prisma';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail =
      this.configService.get<string>('ADMIN_EMAIL') ??
      process.env.ADMIN_EMAIL ??
      'admin@nihongo.local';
    const adminPassword =
      this.configService.get<string>('ADMIN_PASSWORD') ??
      process.env.ADMIN_PASSWORD ??
      'admin123';
    const existing = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hash,
          role: Role.ADMIN,
          name: 'Administrator',
        },
      });
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.USER,
      },
      select: { id: true, email: true, role: true, name: true },
    });

    return {
      access_token: await this.signToken(user),
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return {
      access_token: await this.signToken(user),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });
  }

  private signToken(user: { id: number; email: string; role: Role }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload);
  }
}
