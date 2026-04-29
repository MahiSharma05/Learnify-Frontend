import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">{{ unread() }} unread notifications</p>
      </div>
      @if (unread() > 0) {
        <button class="btn btn--outline btn--sm" (click)="markAll()">Mark All as Read</button>
      }
    </div>

    @if (notifications().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">🔔</div>
        <h3 class="empty-state__title">No notifications</h3>
        <p class="empty-state__desc">You're all caught up!</p>
      </div>
    } @else {
      <div class="card" style="padding:0">
        @for (n of notifications(); track n.id) {
          <div class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
            <div class="notif-item__icon">{{ typeIcon(n.type) }}</div>
            <div class="notif-item__body">
              <div class="notif-item__title">{{ n.title }}</div>
              <div class="notif-item__msg">{{ n.message }}</div>
              <div class="notif-item__time">{{ n.createdAt | date:'medium' }}</div>
            </div>
            <div class="notif-item__right">
              @if (!n.isRead) { <div class="unread-dot"></div> }
              <button class="btn btn--ghost btn--sm" style="font-size:16px" (click)="$event.stopPropagation(); deleteNotif(n.id)">✕</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notif-item { display: flex; align-items: flex-start; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; }
    .notif-item:last-child { border: none; }
    .notif-item:hover { background: var(--bg); }
    .notif-item.unread { background: #f8faff; }
    .notif-item__icon { font-size: 24px; flex-shrink: 0; width: 40px; height: 40px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .notif-item__body { flex: 1; }
    .notif-item__title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
    .notif-item__msg   { font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 6px; }
    .notif-item__time  { font-size: 12px; color: var(--text-muted); }
    .notif-item__right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }
  `]
})
export class NotificationsComponent implements OnInit {
  notifService = inject(NotificationService);
  toast        = inject(ToastService);

  notifications = signal<Notification[]>([]);
  unread = () => this.notifications().filter(n => !n.isRead).length;

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      ENROLLMENT_CONFIRMED: '📚', PAYMENT_SUCCESS: '💳',
      QUIZ_RESULT: '📝', CERTIFICATE_ISSUED: '🏆',
      COURSE_PUBLISHED: '🎓', GENERAL: '🔔',
    };
    return icons[type] || '🔔';
  }

  ngOnInit() {
    this.notifService.getMyNotifications().subscribe(n => this.notifications.set(n));
  }

  markRead(n: Notification) {
    if (n.isRead) return;
    this.notifService.markAsRead(n.id).subscribe(() => {
      this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    });
  }

  markAll() {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      this.toast.success('All notifications marked as read');
    });
  }

  deleteNotif(id: number) {
    this.notifService.deleteNotification(id).subscribe(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
    });
  }
}
