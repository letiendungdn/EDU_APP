import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../core/http/api-client';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-google-sign-in-button',
  standalone: true,
  template: `
    @if (clientId()) {
      <div class="auth-google-wrap">
        <div #buttonHost></div>
      </div>
    } @else {
      <p class="auth-google-hint">
        <strong>Đăng ký bằng Gmail</strong> chưa bật. Thêm
        <code>&lt;meta name="google-signin-client_id" content="..."&gt;</code>
        vào <code>index.html</code> hoặc dùng email + mật khẩu bên dưới.
      </p>
    }
  `,
})
export class GoogleSignInButtonComponent implements AfterViewInit {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() googleError = new EventEmitter<string>();
  @Output() googleSuccess = new EventEmitter<string>();

  private readonly auth = inject(AuthService);
  readonly clientId = signal('');

  @ViewChild('buttonHost') private buttonHost?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    const meta = document.querySelector('meta[name="google-signin-client_id"]');
    const id = meta?.getAttribute('content')?.trim() ?? '';
    if (!id) return;

    this.clientId.set(id);
    void this.loadScript().then(() => this.renderButton(id));
  }

  private loadScript(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-gsi]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Google script failed')));
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset['googleGsi'] = '1';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google script failed'));
      document.head.appendChild(script);
    });
  }

  private renderButton(clientId: string): void {
    const host = this.buttonHost?.nativeElement;
    if (!host || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        void this.handleCredential(response.credential);
      },
    });

    window.google.accounts.id.renderButton(host, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: this.mode === 'register' ? 'signup_with' : 'continue_with',
      shape: 'rectangular',
      width: 360,
      locale: 'vi',
    });
  }

  private async handleCredential(credential?: string): Promise<void> {
    if (!credential) {
      this.googleError.emit('Không nhận được token từ Google');
      return;
    }

    try {
      const user = await this.auth.loginWithGoogle(credential);
      this.googleSuccess.emit(user.role);
    } catch (err) {
      this.googleError.emit(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Google đăng nhập thất bại',
      );
    }
  }
}
