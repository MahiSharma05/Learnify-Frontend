import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (show) {
      <div class="loading" [class.loading--fullscreen]="fullscreen">
        <div class="spinner"></div>
        @if (message) { <p>{{ message }}</p> }
      </div>
    }
  `,
  styles: [`
    .loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px; }
    .loading--fullscreen { position: fixed; inset: 0; background: rgba(255,255,255,.85); z-index: 9998; }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: var(--text-muted); }
  `]
})
export class LoadingComponent {
  @Input() show = true;
  @Input() fullscreen = false;
  @Input() message = '';
}
