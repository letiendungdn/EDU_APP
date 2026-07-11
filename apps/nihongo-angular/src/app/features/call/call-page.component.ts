import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-call-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './call-page.component.html',
  styleUrl: './call-page.component.scss',
})
export class CallPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
}
