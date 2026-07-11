import {
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_GROUPS } from '../core/config/nav-groups';
import { ThemeService } from '../core/services/theme.service';
import { EnglishAppSwitcherComponent } from '../shared/english-app-switcher/english-app-switcher.component';
import { SidebarAuthComponent } from '../shared/sidebar-auth/sidebar-auth.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    EnglishAppSwitcherComponent,
    SidebarAuthComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);

  readonly navGroups = NAV_GROUPS;
  readonly sidebarOpen = signal(false);
  readonly isAuthScreen = signal(this.isAuthPath(this.router.url));
  readonly year = new Date().getFullYear();

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAuthScreen.set(this.isAuthPath(event.urlAfterRedirects));
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
