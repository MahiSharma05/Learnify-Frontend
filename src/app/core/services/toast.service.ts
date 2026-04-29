import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, duration = 4000): void {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(msg: string)  { this.show('success', msg); }
  error(msg: string)    { this.show('error',   msg); }
  warning(msg: string)  { this.show('warning', msg); }
  info(msg: string)     { this.show('info',    msg); }

  remove(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
