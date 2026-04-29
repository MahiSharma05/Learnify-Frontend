import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { User, Course, Enrollment, Payment } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-hero">
      <h1>⚙️ Admin Dashboard</h1>
      <p>Platform-wide oversight and management</p>
    </div>

    <!-- KPI Stats -->
    <div class="grid grid--4" style="margin-bottom:28px">
      <div class="stat-card">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__value">{{ users().length }}</div>
        <div class="stat-card__label">Total Users</div>
        <div class="stat-card__sub">
          {{ students() }} students · {{ instructors() }} instructors
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📚</div>
        <div class="stat-card__value">{{ courses().length }}</div>
        <div class="stat-card__label">Total Courses</div>
        <div class="stat-card__sub">{{ publishedCourses() }} published</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📋</div>
        <div class="stat-card__value">{{ enrollments().length }}</div>
        <div class="stat-card__label">Enrollments</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">💰</div>
        <div class="stat-card__value">₹{{ totalRevenue() }}</div>
        <div class="stat-card__label">Total Revenue</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <h2 class="section-title">Quick Actions</h2>
    <div class="quick-actions">
      @for (a of actions; track a.label) {
        <a [routerLink]="a.route" class="action-card">
          <span class="action-card__icon">{{ a.icon }}</span>
          <span class="action-card__label">{{ a.label }}</span>
          <span class="action-card__arrow">→</span>
        </a>
      }
    </div>

    <!-- Recent Users -->
    <h2 class="section-title" style="margin-top:28px">Recent Users</h2>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (u of users().slice(0, 8); track u.userId) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar-sm">{{ u.fullName[0]?.toUpperCase() }}</div>
                    {{ u.fullName }}
                  </div>
                </td>
                <td style="color:var(--text-muted)">{{ u.email }}</td>
                <td>
                  <span class="badge"
                    [class]="u.role==='ADMIN'?'badge--danger':u.role==='INSTRUCTOR'?'badge--success':'badge--primary'">
                    {{ u.role }}
                  </span>
                </td>
                <td>
                  <button class="btn btn--danger btn--sm" (click)="suspendUser(u)">Suspend</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pending Course Approvals -->
    @if (pendingCourses().length > 0) {
      <h2 class="section-title" style="margin-top:28px">Pending Course Approvals</h2>
      <div style="display:flex;flex-direction:column;gap:10px">
        @for (c of pendingCourses(); track c.courseId) {
          <div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <h4 style="font-weight:700">{{ c.title }}</h4>
              <p style="font-size:13px;color:var(--text-muted)">{{ c.category }} · {{ c.level }}</p>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn--success btn--sm" (click)="approve(c.courseId)">✓ Approve</button>
              <button class="btn btn--danger btn--sm"  (click)="reject(c.courseId)">✗ Reject</button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .admin-hero { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border-radius: 16px; padding: 28px 32px; margin-bottom: 28px; }
    .admin-hero h1 { font-size: 26px; font-weight: 900; margin-bottom: 4px; }
    .admin-hero p  { opacity: .7; font-size: 15px; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; margin-bottom: 8px; }
    .action-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; text-decoration: none; transition: border-color .15s, transform .15s; }
    .action-card:hover { border-color: var(--primary); transform: translateY(-2px); }
    .action-card__icon  { font-size: 28px; }
    .action-card__label { font-size: 14px; font-weight: 600; color: var(--text); }
    .action-card__arrow { font-size: 18px; color: var(--primary); margin-top: auto; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  adminService  = inject(AdminService);
  courseService = inject(CourseService);
  enrollService = inject(EnrollmentService);
  paymentService= inject(PaymentService);

  users       = signal<User[]>([]);
  courses     = signal<Course[]>([]);
  enrollments = signal<Enrollment[]>([]);
  payments    = signal<Payment[]>([]);

  students         = () => this.users().filter(u => u.role === 'STUDENT').length;
  instructors      = () => this.users().filter(u => u.role === 'INSTRUCTOR').length;
  publishedCourses = () => this.courses().filter(c => c.isPublished).length;
  pendingCourses   = () => this.courses().filter(c => !c.isPublished);
  totalRevenue     = () => this.payments().filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);

  actions = [
    { icon: '👥', label: 'Manage Users',       route: '/admin/users' },
    { icon: '📚', label: 'Manage Courses',     route: '/admin/courses' },
    { icon: '📋', label: 'Enrollments',        route: '/admin/enrollments' },
    { icon: '💳', label: 'Payments',           route: '/admin/payments' },
    { icon: '🏆', label: 'Certificates',       route: '/admin/certificates' },
    { icon: '📣', label: 'Notifications',      route: '/admin/notifications' },
    { icon: '💬', label: 'Discussions',        route: '/admin/discussions' },
    { icon: '📊', label: 'Analytics',          route: '/admin/analytics' },
  ];

  ngOnInit() {
    this.adminService.getAllUsers().subscribe(u => this.users.set(u));
    this.courseService.getAllCourses().subscribe(c => this.courses.set(c));
    this.enrollService.getAllEnrollments().subscribe(e => this.enrollments.set(e));
    this.paymentService.getAllPayments().subscribe(p => this.payments.set(p));
  }

  suspendUser(u: User) {
    if (!confirm(`Suspend ${u.fullName}?`)) return;
    this.adminService.suspendUser(u.userId).subscribe(() => {
      alert('User suspended');
    });
  }

  approve(id: number) { this.courseService.approveCourse(id).subscribe(() => this.ngOnInit()); }
  reject(id: number)  { this.courseService.rejectCourse(id, 'Does not meet guidelines').subscribe(() => this.ngOnInit()); }
}
