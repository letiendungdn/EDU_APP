import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { randomBytes } from "crypto";
import { PrismaService } from "@app/prisma";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 7;

const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  name: true,
  avatarUrl: true,
  nativeLanguage: true,
  targetJlptLevel: true,
  studyGoalMinutes: true,
  googleId: true,
  passwordHash: true,
  createdAt: true,
} as const;

type PublicUserRow = {
  id: number;
  email: string;
  role: Role;
  name: string | null;
  avatarUrl: string | null;
  nativeLanguage: string | null;
  targetJlptLevel: string | null;
  studyGoalMinutes: number | null;
  googleId: string | null;
  passwordHash: string | null;
  createdAt: Date;
};

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail =
      this.configService.get<string>("ADMIN_EMAIL") ??
      process.env.ADMIN_EMAIL ??
      "admin@nihongo.local";
    const adminPassword =
      this.configService.get<string>("ADMIN_PASSWORD") ??
      process.env.ADMIN_PASSWORD ??
      "admin123";
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
          name: "Administrator",
        },
      });
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email đã được sử dụng");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: Role.USER,
      },
      select: publicUserSelect,
    });

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.toPublicUser(user),
    };
  }

  async loginWithGoogle(dto: GoogleAuthDto) {
    const clientId =
      this.configService.get<string>("GOOGLE_CLIENT_ID") ??
      process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new BadRequestException("Google OAuth chưa được cấu hình trên server");
    }

    const client = new OAuth2Client(clientId);
    let payload: { sub?: string; email?: string; name?: string; picture?: string };
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.credential,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? {};
    } catch {
      throw new UnauthorizedException("Token Google không hợp lệ");
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("Token Google thiếu thông tin email");
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      select: publicUserSelect,
    });

    if (user) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? googleId,
          name: user.name ?? payload.name ?? null,
          avatarUrl: user.avatarUrl ?? payload.picture ?? null,
        },
        select: publicUserSelect,
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          name: payload.name ?? null,
          avatarUrl: payload.picture ?? null,
          role: Role.USER,
        },
        select: publicUserSelect,
      });
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.toPublicUser(user) };
  }

  async refreshTokens(refreshToken: string) {
    const [tokenId, secret] = refreshToken.split(".");
    if (!tokenId || !secret) {
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
      include: {
        user: { select: publicUserSelect },
      },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException(
        "Refresh token không hợp lệ hoặc đã hết hạn",
      );
    }

    const valid = await bcrypt.compare(secret, stored.token);
    if (!valid) {
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.generateTokens(stored.user);
  }

  async revokeRefreshToken(refreshToken: string) {
    const [tokenId, secret] = refreshToken.split(".");
    if (!tokenId || !secret) return;

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });
    if (!stored || stored.revoked) return;

    const valid = await bcrypt.compare(secret, stored.token);
    if (!valid) return;

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: publicUserSelect,
    });
    if (!user?.passwordHash) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) return null;
    return this.toPublicUser(user);
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.nativeLanguage !== undefined
          ? { nativeLanguage: dto.nativeLanguage }
          : {}),
        ...(dto.targetJlptLevel !== undefined
          ? { targetJlptLevel: dto.targetJlptLevel }
          : {}),
        ...(dto.studyGoalMinutes !== undefined
          ? { studyGoalMinutes: dto.studyGoalMinutes }
          : {}),
      },
      select: publicUserSelect,
    });
    return this.toPublicUser(user);
  }

  toPublicUser(user: PublicUserRow) {
    const { passwordHash, googleId, ...rest } = user;
    return {
      ...rest,
      hasPassword: !!passwordHash,
      isGoogleLinked: !!googleId,
    };
  }

  async generateTokens(user: {
    id: number;
    email: string;
    role: Role;
    name?: string | null;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const secret = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(secret, 12);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

    const record = await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token,
      refresh_token: `${record.id}.${secret}`,
    };
  }
}
