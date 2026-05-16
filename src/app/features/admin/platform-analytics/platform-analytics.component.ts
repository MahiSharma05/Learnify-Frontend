import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Platform Analytics</h1>
    <p class="page-subtitle">Comprehensive platform performance data</p>

    <!-- KPI Grid -->
    <div class="grid grid--4" style="margin-bottom:28px">
      <div class="stat-card">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__value">{{ stats().users }}</div>
        <div class="stat-card__label">Total Users</div>
        <div class="stat-card__sub">{{ stats().students }} students · {{ stats().instructors }} instructors</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📚</div>
        <div class="stat-card__value">{{ stats().courses }}</div>
        <div class="stat-card__label">Total Courses</div>
        <div class="stat-card__sub">{{ stats().publishedCourses }} published</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📋</div>
        <div class="stat-card__value">{{ stats().enrollments }}</div>
        <div class="stat-card__label">Enrollments</div>
        <div class="stat-card__sub">{{ stats().completedEnrollments }} completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">💰</div>
        <div class="stat-card__value">₹{{ stats().revenue }}</div>
        <div class="stat-card__label">Total Revenue</div>
        <div class="stat-card__sub">{{ stats().payments }} transactions</div>
      </div>
    </div>

    <div class="grid grid--2">
      <!-- User Distribution -->
      <div class="card">
        <h3 class="section-title">User Distribution</h3>
        <div style="display:flex;flex-direction:column;gap:14px">
          @for (item of userDist(); track item.label) {
            <div>
              <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }} ({{ item.pct }}%)</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-bar__fill" [style.width.%]="item.pct" [style.background]="item.color"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Revenue Summary -->
      <div class="card">
        <h3 class="section-title">Revenue Summary</h3>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="rev-row">
            <span>Total Revenue</span>
            <strong style="color:var(--success)">₹{{ stats().revenue }}</strong>
          </div>
          <div class="rev-row">
            <span>Avg per Enrollment</span>
            <strong>₹{{ stats().enrollments > 0 ? Math.round(stats().revenue / stats().enrollments) : 0 }}</strong>
          </div>
          <div class="rev-row">
            <span>Total Payments</span>
            <strong>{{ stats().payments }}</strong>
          </div>
          <div class="rev-row">
            <span>Certificates Issued</span>
            <strong style="color:var(--primary)">{{ stats().certificates }}</strong>
          </div>
          <div class="rev-row">
            <span>Completion Rate</span>
            <strong>{{ stats().enrollments > 0 ? Math.round((stats().completedEnrollments / stats().enrollments) * 100) : 0 }}%</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rev-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
    .rev-row:last-child { border: none; }
  `]
})
export class PlatformAnalyticsComponent implements OnInit {
  adminService   = inject(AdminService);
  courseService  = inject(CourseService);
  enrollService  = inject(EnrollmentService);
  paymentService = inject(PaymentService);
  progressService= inject(ProgressService);

  Math = Math;

  stats = signal({
    users: 0, students: 0, instructors: 0, admins: 0,
    courses: 0, publishedCourses: 0,
    enrollments: 0, completedEnrollments: 0,
    payments: 0, revenue: 0,
    certificates: 0,
  });

  userDist = () => {
    const s = this.stats();
    const total = s.users || 1;
    return [
      { label: 'Students',    value: s.students,    pct: Math.round(s.students / total * 100),    color: '#4f46e5' },
      { label: 'Instructors', value: s.instructors, pct: Math.round(s.instructors / total * 100), color: '#10b981' },
      { label: 'Admins',      value: s.admins,      pct: Math.round(s.admins / total * 100),      color: '#ef4444' },
    ];
  };

  ngOnInit() {
    this.adminService.getAllUsers().subscribe(users => {
      this.stats.update(s => ({
        ...s,
        users:       users.length,
        students:    users.filter(u => u.role === 'STUDENT').length,
        instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
        admins:      users.filter(u => u.role === 'ADMIN').length,
      }));
    });

    this.courseService.getAllCourses().subscribe(courses => {
      this.stats.update(s => ({
        ...s,
        courses:          courses.length,
        publishedCourses: courses.filter(c => c.published).length,
      }));
    });

    this.enrollService.getAllEnrollments().subscribe(enrollments => {
      this.stats.update(s => ({
        ...s,
        enrollments:          enrollments.length,
        completedEnrollments: enrollments.filter(e => e.status === 'COMPLETED').length,
      }));
    });

    this.paymentService.getAllPayments().subscribe(payments => {
      this.stats.update(s => ({
        ...s,
        payments: payments.length,
        revenue:  payments.filter(p => p.status === 'SUCCESS').reduce((acc, p) => acc + p.amount, 0),
      }));
    });

    this.progressService.getAllCertificates().subscribe(certs => {
      this.stats.update(s => ({ ...s, certificates: certs.length }));
    });
  }
}
