import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ProgressService } from '../../../core/services/progress.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Enrollment, Certificate, Notification } from '../../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-banner">
      <div>
        <h1>Welcome back, {{ auth.user()?.fullName?.split(' ')![0] }}! 👋</h1>
        <p>Ready to continue your learning journey?</p>
      </div>
      <a routerLink="/courses" class="btn btn--primary">Explore Courses →</a>
    </div>

    <!-- Stats -->
    <div class="grid grid--4" style="margin-bottom:28px">
      <div class="stat-card">
        <div class="stat-card__icon">📚</div>
        <div class="stat-card__value">{{ enrollments().length }}</div>
        <div class="stat-card__label">Enrolled Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">✅</div>
        <div class="stat-card__value">{{ completed().length }}</div>
        <div class="stat-card__label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">🏆</div>
        <div class="stat-card__value">{{ certificates().length }}</div>
        <div class="stat-card__label">Certificates</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📈</div>
        <div class="stat-card__value">{{ avgProgress() }}%</div>
        <div class="stat-card__label">Avg. Progress</div>
      </div>
    </div>

    <!-- Continue Learning -->
    <section style="margin-bottom:32px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 class="section-title" style="margin:0">Continue Learning</h2>
        <a routerLink="/my-courses" class="btn btn--ghost">View All →</a>
      </div>
      @if (enrollments().length === 0) {
        <div class="empty-state">
          <div class="empty-state__icon">📖</div>
          <h3 class="empty-state__title">No courses yet</h3>
          <p class="empty-state__desc">Browse the course catalog and enroll in your first course!</p>
          <a routerLink="/courses" class="btn btn--primary">Browse Courses</a>
        </div>
      } @else {
        <div class="grid grid--auto">
          @for (e of enrollments().slice(0, 4); track e.enrollmentId) {
            <div class="enroll-card">
              <div class="enroll-card__head">
                <img [src]="e.courseThumbnail || 'assets/default-course.svg'" alt="">
                <span class="badge" [class]="'badge--' + statusBadge(e.status)">{{ e.status }}</span>
              </div>
              <div class="enroll-card__body">
                <h4>{{ e.courseTitle || 'Course #' + e.courseId }}</h4>
                <div class="enroll-card__progress">
                  <div class="progress-bar">
                    <div class="progress-bar__fill" [style.width.%]="e.progressPercent"
                      [class]="e.progressPercent === 100 ? 'progress-bar--success' : ''"></div>
                  </div>
                  <span>{{ e.progressPercent }}%</span>
                </div>
                <a [routerLink]="['/courses', e.courseId, 'learn']" class="btn btn--primary btn--sm btn--full">
                  {{ e.progressPercent === 0 ? 'Start Learning' : 'Continue' }}
                </a>
              </div>
            </div>
          }
        </div>
      }
    </section>

    <!-- Recent Notifications -->
    @if (notifications().length > 0) {
      <section>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h2 class="section-title" style="margin:0">Recent Notifications</h2>
          <a routerLink="/notifications" class="btn btn--ghost">View All →</a>
        </div>
        <div class="card">
          @for (n of notifications().slice(0, 5); track n.id) {
            <div class="notif-row" [class.unread]="!n.isRead">
              <div class="notif-row__dot" [class.unread]="!n.isRead"></div>
              <div class="notif-row__body">
                <strong>{{ n.title }}</strong>
                <p>{{ n.message }}</p>
                <small>{{ n.createdAt | date:'short' }}</small>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .welcome-banner { background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: #fff; border-radius: 16px; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .welcome-banner h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
    .welcome-banner p  { opacity: .85; font-size: 15px; }
    .welcome-banner .btn--primary { background: #fff; color: #4f46e5; }
    .enroll-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
    .enroll-card__head { position: relative; aspect-ratio: 16/9; overflow: hidden; }
    .enroll-card__head img { width: 100%; height: 100%; object-fit: cover; background: #eef2ff; }
    .enroll-card__head .badge { position: absolute; top: 8px; right: 8px; }
    .enroll-card__body { padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .enroll-card__body h4 { font-size: 14px; font-weight: 700; }
    .enroll-card__progress { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--text-muted); }
    .enroll-card__progress .progress-bar { flex: 1; }
    .notif-row { display: flex; gap: 12px; padding: 14px; border-bottom: 1px solid var(--border); }
    .notif-row:last-child { border-bottom: none; }
    .notif-row.unread { background: #f8faff; }
    .notif-row__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); margin-top: 6px; flex-shrink: 0; }
    .notif-row__dot.unread { background: var(--primary); }
    .notif-row__body strong { font-size: 14px; }
    .notif-row__body p  { font-size: 13px; color: var(--text-muted); margin: 2px 0; }
    .notif-row__body small { font-size: 12px; color: var(--text-muted); }
  `]
})
export class StudentDashboardComponent implements OnInit {
  auth           = inject(AuthService);
  enrollService  = inject(EnrollmentService);
  progressService= inject(ProgressService);
  notifService   = inject(NotificationService);

  enrollments    = signal<Enrollment[]>([]);
  certificates   = signal<Certificate[]>([]);
  notifications  = signal<Notification[]>([]);

  completed  = () => this.enrollments().filter(e => e.status === 'COMPLETED');
  avgProgress= () => {
    const list = this.enrollments();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, e) => s + e.progressPercent, 0) / list.length);
  };

  statusBadge(s: string) { return s === 'COMPLETED' ? 'success' : s === 'CANCELLED' ? 'danger' : 'primary'; }

  ngOnInit() {
    this.enrollService.getMyEnrollments().subscribe(e => this.enrollments.set(e));
    this.progressService.getMyCertificates().subscribe(c => this.certificates.set(c));
    this.notifService.getMyNotifications().subscribe(n => this.notifications.set(n));
  }
}
