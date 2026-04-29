import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-send-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1 class="page-title">Send Platform Notifications</h1>
    <p class="page-subtitle">Broadcast messages to users</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:flex-start">
      <!-- Send Form -->
      <div class="card">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Compose Notification</h3>
        <form [formGroup]="form" (ngSubmit)="send()">
          <div class="form-group">
            <label class="form-label">Notification Type</label>
            <select class="form-control" formControlName="type">
              @for (t of types; track t.value) {
                <option [value]="t.value">{{ t.label }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input class="form-control" formControlName="title" placeholder="Notification title">
          </div>
          <div class="form-group">
            <label class="form-label">Message *</label>
            <textarea class="form-control" formControlName="message" rows="4" placeholder="Notification body..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Send Email</label>
            <div style="display:flex;align-items:center;gap:10px">
              <input type="checkbox" formControlName="sendEmail" id="sendEmail">
              <label for="sendEmail" style="font-size:14px;color:var(--text-muted)">Also send email alert</label>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Target (User ID, leave empty for broadcast)</label>
            <input class="form-control" type="number" formControlName="userId" placeholder="e.g. 42 (optional)">
          </div>
          @if (error()) { <div style="background:#fee2e2;color:#991b1b;padding:10px;border-radius:8px;margin-bottom:12px">{{ error() }}</div> }
          <button class="btn btn--primary btn--full" type="submit" [disabled]="sending()">
            {{ sending() ? 'Sending...' : '📣 Send Notification' }}
          </button>
        </form>
      </div>

      <!-- Preview -->
      <div>
        <div class="card">
          <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Preview</h3>
          <div class="notif-preview">
            <div class="notif-preview__icon">{{ typeIcon(form.value.type || 'GENERAL') }}</div>
            <div>
              <strong>{{ form.value.title || 'Notification Title' }}</strong>
              <p>{{ form.value.message || 'Notification message will appear here...' }}</p>
            </div>
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <h4 style="font-size:14px;font-weight:700;margin-bottom:10px">Quick Templates</h4>
          @for (t of templates; track t.title) {
            <button class="btn btn--outline btn--sm btn--full" style="margin-bottom:8px;justify-content:flex-start" (click)="applyTemplate(t)">
              {{ t.icon }} {{ t.title }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-preview { display: flex; gap: 14px; align-items: flex-start; padding: 16px; background: var(--bg); border-radius: 10px; }
    .notif-preview__icon { font-size: 28px; }
    .notif-preview strong { font-size: 14px; display: block; margin-bottom: 4px; }
    .notif-preview p { font-size: 13px; color: var(--text-muted); }
  `]
})
export class SendNotificationsComponent {
  notifService = inject(NotificationService);
  toast        = inject(ToastService);
  fb           = inject(FormBuilder);

  sending = signal(false);
  error   = signal('');

  types = [
    { value: 'GENERAL',              label: 'General' },
    { value: 'ENROLLMENT_CONFIRMED', label: 'Enrollment' },
    { value: 'PAYMENT_SUCCESS',      label: 'Payment' },
    { value: 'COURSE_PUBLISHED',     label: 'Course Update' },
    { value: 'QUIZ_RESULT',          label: 'Quiz Result' },
    { value: 'CERTIFICATE_ISSUED',   label: 'Certificate' },
  ];

  templates = [
    { icon: '🎉', title: 'New Course Available', type: 'COURSE_PUBLISHED', message: 'A new course has been published on Learnify. Check it out!' },
    { icon: '🛡️', title: 'Platform Maintenance', type: 'GENERAL', message: 'Scheduled maintenance on Saturday 2–4 AM. Services may be briefly unavailable.' },
    { icon: '🏆', title: 'Congratulations!', type: 'CERTIFICATE_ISSUED', message: 'Congratulations on completing your course! Your certificate has been issued.' },
  ];

  form = this.fb.group({
    type:      ['GENERAL'],
    title:     ['', Validators.required],
    message:   ['', Validators.required],
    sendEmail: [false],
    userId:    [null],
  });

  typeIcon(type: string): string {
    const icons: Record<string, string> = {
      GENERAL: '🔔', ENROLLMENT_CONFIRMED: '📚', PAYMENT_SUCCESS: '💳',
      COURSE_PUBLISHED: '🎓', QUIZ_RESULT: '📝', CERTIFICATE_ISSUED: '🏆',
    };
    return icons[type] || '🔔';
  }

  applyTemplate(t: any) {
    this.form.patchValue({ type: t.type, title: t.title, message: t.message });
  }

  send() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.sending.set(true); this.error.set('');
    const v = this.form.value;
    const payload: any = {
      type: v.type, title: v.title, message: v.message, sendEmail: v.sendEmail,
      ...(v.userId ? { userIds: [v.userId] } : {}),
    };
    this.notifService.sendBulkNotification(payload).subscribe({
      next: () => { this.sending.set(false); this.toast.success('Notification sent!'); this.form.reset({ type: 'GENERAL', sendEmail: false }); },
      error: e => { this.sending.set(false); this.error.set(e.error?.message || 'Failed to send notification'); }
    });
  }
}
