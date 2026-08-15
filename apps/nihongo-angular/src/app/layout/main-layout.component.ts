import {
  Component,
  HostListener,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { NgStyle, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_GROUPS } from '../core/config/nav-groups';
import { PageBannerService } from '../core/services/page-banner.service';
import { ThemeService } from '../core/services/theme.service';
import { EnglishAppSwitcherComponent } from '../shared/english-app-switcher/english-app-switcher.component';
import { PageBannerControlComponent } from '../shared/page-banner-control/page-banner-control.component';
import { SidebarAuthComponent } from '../shared/sidebar-auth/sidebar-auth.component';

const SIDEBAR_COLLAPSED_KEY = 'nihongo-sidebar-collapsed';
const NAV_GROUPS_COLLAPSED_KEY = 'nihongo-nav-groups-collapsed';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    NgStyle,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    EnglishAppSwitcherComponent,
    PageBannerControlComponent,
    SidebarAuthComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly theme = inject(ThemeService);
  readonly banners = inject(PageBannerService);

  readonly navGroups = NAV_GROUPS;
  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly collapsedGroups = signal<ReadonlySet<string>>(new Set());
  readonly isAuthScreen = signal(this.isAuthPath(this.router.url));
  readonly year = new Date().getFullYear();

  constructor() {
    this.banners.setPath(this.router.url);
    this.restoreSidebarPrefs();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthScreen.set(this.isAuthPath(event.urlAfterRedirects));
        this.banners.setPath(event.urlAfterRedirects);
        this.closeSidebar();
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleCollapsed(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    this.writePref(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
  }

  isGroupCollapsed(label: string): boolean {
    if (this.sidebarCollapsed()) return false;
    return this.collapsedGroups().has(label);
  }

  toggleGroup(label: string): void {
    const next = new Set(this.collapsedGroups());
    if (next.has(label)) next.delete(label);
    else next.add(label);
    this.collapsedGroups.set(next);
    this.writePref(NAV_GROUPS_COLLAPSED_KEY, JSON.stringify([...next]));
  }

  isDark(): boolean {
    return this.theme.theme() === 'dark';
  }

  private restoreSidebarPrefs(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.sidebarCollapsed.set(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
    try {
      const raw = localStorage.getItem(NAV_GROUPS_COLLAPSED_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
        this.collapsedGroups.set(new Set(parsed));
      }
    } catch {
      /* ignore invalid storage */
    }
  }

  private writePref(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(key, value);
  }

  private isAuthPath(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/login' || path === '/profile';
  }
}
