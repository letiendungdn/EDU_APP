import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ApiError, getStoredToken, setStoredToken } from '../http/api-client';
import { signoutKeycloak } from '../utils/keycloak.util';
import type { AuthUser, LoginResponse, UpdateProfileInput } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly tokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly readySignal = signal(false);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly authReady = this.readySignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'ADMIN');
  readonly isTeacher = computed(
    () => this.userSignal()?.role === 'TEACHER' || this.userSignal()?.role === 'ADMIN',
  );

  init(): void {
    const stored = getStoredToken();
    this.tokenSignal.set(stored);
    this.readySignal.set(true);
    if (stored) void this.refreshMe(stored);
  }

  private applySession(res: LoginResponse): AuthUser {
    setStoredToken(res.access_token);
    this.tokenSignal.set(res.access_token);
    this.userSignal.set(res.user);
    return res.user;
  }

  async refreshMe(token = this.tokenSignal()): Promise<AuthUser | null> {
    if (!token) {
      this.userSignal.set(null);
      return null;
    }
    try {
      const user = await this.api.fetchAuthMe(token);
      this.userSignal.set(user);
      return user;
    } catch {
      setStoredToken(null);
      this.tokenSignal.set(null);
      this.userSignal.set(null);
      return null;
    }
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const res = await this.api.login(email, password);
    return this.applySession(res);
  }

  async loginAdmin(email: string, password: string): Promise<AuthUser> {
    const res = await this.api.login(email, password);
    if (res.user.role !== 'ADMIN') {
      throw new ApiError('Tài khoản không có quyền admin', 403);
    }
    return this.applySession(res);
  }

  async register(email: string, password: string): Promise<AuthUser> {
    const res = await this.api.register(email, password);
    return this.applySession(res);
  }

  async loginWithGoogle(credential: string): Promise<AuthUser> {
    const res = await this.api.loginWithGoogle(credential);
    return this.applySession(res);
  }

  async loginWithOidc(accessToken: string, idToken?: string): Promise<AuthUser> {
    const res = await this.api.loginWithOidc(accessToken, idToken);
    return this.applySession(res);
  }

  async updateProfile(data: UpdateProfileInput): Promise<AuthUser> {
    const token = this.tokenSignal();
    if (!token) throw new ApiError('Chưa đăng nhập', 401);
    const user = await this.api.updateProfile(token, data);
    this.userSignal.set(user);
    return user;
  }

  async logout(): Promise<void> {
    const token = this.tokenSignal();
    if (token) {
      try {
        await this.api.logout(token);
      } catch {
        /* ignore */
      }
    }
    setStoredToken(null);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    await signoutKeycloak();
  }
}
