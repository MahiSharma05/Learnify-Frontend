import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Course, Enrollment } from '../../../core/models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Course Analytics</h1>
    <p class="page-subtitle">Performance overview of your courses</p>

    <div class="grid grid--4" style="margin-bottom:28px">
      <div class="stat-card">
        <div class="stat-card__icon">📚</div>
        <div class="stat-card__value">{{ courses().length }}</div>
        <div class="stat-card__label">Total Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__value">{{ totalStudents() }}</div>
        <div class="stat-card__label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">✅</div>
        <div class="stat-card__value">{{ completionRate() }}%</div>
        <div class="stat-card__label">Completion Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">💰</div>
        <div class="stat-card__value">₹{{ estimatedRevenue() }}</div>
        <div class="stat-card__label">Est. Revenue</div>
      </div>
    </div>

    <h2 class="section-title">Course Performance</h2>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Status</th>
              <th>Price</th>
              <th>Students</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            @for (c of courses(); track c.courseId) {
              <tr>
                <td style="font-weight:600">{{ c.title }}</td>
                <td>
                  <span class="badge" [class]="c.isPublished ? 'badge--success' : 'badge--muted'">
                    {{ c.isPublished ? 'Published' : 'Draft' }}
                  </span>
                </td>
                <td>{{ c.price === 0 ? 'Free' : '₹' + c.price }}</td>
                <td>{{ enrollCountMap()[c.courseId] || 0 }}</td>
                <td style="font-weight:700;color:var(--primary)">
                  ₹{{ c.price * (enrollCountMap()[c.courseId] || 0) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (courses().length > 0) {
      <h2 class="section-title" style="margin-top:28px">Enrollment by Course</h2>
      <div class="card">
        @for (c of courses(); track c.courseId) {
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:14px;font-weight:500">{{ c.title }}</span>
              <span style="font-size:13px;color:var(--text-muted)">{{ enrollCountMap()[c.courseId] || 0 }} students</span>
            </div>
            <div class="progress-bar" style="height:12px">
              <div class="progress-bar__fill"
                [style.width.%]="barWidth(c.courseId)">
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class AnalyticsComponent implements OnInit {
  auth          = inject(AuthService);
  courseService = inject(CourseService);
  enrollService = inject(EnrollmentService);

  courses        = signal<Course[]>([]);
  enrollCountMap = signal<Record<number, number>>({});

  totalStudents = () => Object.values(this.enrollCountMap()).reduce((s, n) => s + n, 0);

  completionRate = () => 0; // Would need per-enrollment progress data

  estimatedRevenue = () => {
    return this.courses().reduce((s, c) => s + (c.price * (this.enrollCountMap()[c.courseId] || 0)), 0);
  };

  maxEnrolls = () => Math.max(...Object.values(this.enrollCountMap()), 1);
  barWidth(courseId: number) {
    const max = this.maxEnrolls();
    return max > 0 ? ((this.enrollCountMap()[courseId] || 0) / max) * 100 : 0;
  }

  ngOnInit() {
    this.courseService.getCoursesByInstructor(this.auth.user()!.userId).subscribe(courses => {
      this.courses.set(courses);
      courses.forEach(c => {
        this.enrollService.getEnrollmentCount(c.courseId).subscribe(r => {
          this.enrollCountMap.update(m => ({ ...m, [c.courseId]: r.count }));
        });
      });
    });
  }
}
