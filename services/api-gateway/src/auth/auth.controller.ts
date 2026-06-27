import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import {
  CurrentUser,
  JwtAuthGuard,
  Public,
  RateLimit,
  SlidingWindowRateLimitGuard,
  type AuthUserPayload,
} from "@app/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { GoogleAuthDto } from "./dto/google-auth.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

@ApiTags("auth")
@Controller("api/auth")
@UseGuards(SlidingWindowRateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @RateLimit(3, 3600)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("register")
  @ApiOperation({ summary: "Đăng ký tài khoản mới" })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Public()
  @RateLimit(10, 60)
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  @Post("google")
  @ApiOperation({ summary: "Đăng nhập / đăng ký bằng Google ID token" })
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginWithGoogle(dto);
    setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Public()
  @RateLimit(5, 60)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("login")
  @ApiOperation({ summary: "Đăng nhập — trả JWT access token" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    setRefreshCookie(res, result.refresh_token);
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post("refresh")
  @ApiOperation({ summary: "Làm mới access token bằng refresh token (cookie)" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      clearRefreshCookie(res);
      throw new UnauthorizedException("Refresh token không tìm thấy");
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    setRefreshCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Đăng xuất — revoke refresh token và xóa cookie" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }
    clearRefreshCookie(res);
    return { message: "Đã đăng xuất" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Thông tin user hiện tại" })
  me(@CurrentUser() user: AuthUserPayload) {
    return this.authService.getProfile(user.id);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cập nhật thông tin cá nhân" })
  updateMe(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}
