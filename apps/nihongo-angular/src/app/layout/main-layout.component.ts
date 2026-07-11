import {
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgStyle } from '@angular/common';
import { NAV_GROUPS } from '../core/config/nav-groups';
import { PageBannerService } from '../core/services/page-banner.service';
import { ThemeService } from '../core/services/theme.service';
import { EnglishAppSwitcherComponent } from '../shared/english-app-switcher/english-app-switcher.component';
import { PageBannerControlComponent } from '../shared/page-banner-control/page-banner-control.component';
import { SidebarAuthComponent } from '../shared/sidebar-auth/sidebar-auth.component';

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
  readonly theme = inject(ThemeService);
  readonly banners = inject(PageBannerService);

  readonly navGroups = NAV_GROUPS;
  readonly sidebarOpen = signal(false);
  readonly isAuthScreen = signal(this.isAuthPath(this.router.url));
  readonly year = new Date().getFullYear();

  constructor() {
    this.banners.setPath(this.router.url);

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

  isDark(): boolean {
    return this.theme.theme() === 'dark';
  }

  private isAuthPath(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/login' || path === '/profile';
  }
}
