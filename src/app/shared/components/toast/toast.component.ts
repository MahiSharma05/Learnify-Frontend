import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" (click)="toastService.remove(toast.id)">
          <span class="toast__icon">{{ icons[toast.type] }}</span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button class="toast__close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      animation: slideIn .3s ease;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,.15);
    }
    .toast--success { background: #10b981; color: #fff; }
    .toast--error   { background: #ef4444; color: #fff; }
    .toast--warning { background: #f59e0b; color: #fff; }
    .toast--info    { background: #3b82f6; color: #fff; }
    .toast__close   { margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: 16px; }
    @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
  icons: Record<string, string> = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
}
