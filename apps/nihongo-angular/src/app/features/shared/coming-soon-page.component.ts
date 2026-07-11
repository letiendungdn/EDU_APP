import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="container coming-soon glass-panel">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <p class="hint">Trang này chưa port sang Angular. Dùng bản React (port 5173) hoặc chờ migrate tiếp.</p>
      <a routerLink="/">← Về Home</a>
    </section>
  `,
  styles: `
    .coming-soon {
      padding: 2rem;
      text-align: center;
      max-width: 640px;
      margin: 0 auto;
    }
    h2 { margin-bottom: 0.5rem; }
    p { color: var(--text-secondary); line-height: 1.6; margin: 0.75rem 0; }
    .hint { font-size: 0.92rem; }
    a { color: #a5b4fc; font-weight: 600; }
  `,
})
export class ComingSoonPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = this.route.snapshot.data['title'] ?? 'Đang phát triển';
  readonly description =
    this.route.snapshot.data['description'] ?? 'Feature sẽ được chuyển từ React sang Angular.';
}
