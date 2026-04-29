import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="welcome-banner" style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff">
      <div>
        <h1>Instructor Dashboard 🎓</h1>
        <p>Welcome back, {{ auth.user()?.fullName }}!</p>
      </div>
      <a routerLink="/instructor/courses/new" class="btn" style="background:#fff;color:#0f172a;font-weight:700">+ Create Course</a>
    </div>

    <div class="grid grid--4" style="margin-bottom:28px">
      <div class="stat-card">
        <div class="stat-card__icon">📚</div>
        <div class="stat-card__value">{{ courses().length }}</div>
        <div class="stat-card__label">Total Courses</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">✅</div>
        <div class="stat-card__value">{{ published().length }}</div>
        <div class="stat-card__label">Published</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__value">{{ totalEnrollments() }}</div>
        <div class="stat-card__label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📝</div>
        <div class="stat-card__value">{{ courses().length - published().length }}</div>
        <div class="stat-card__label">Drafts</div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h2 class="section-title" style="margin:0">My Courses</h2>
      <a routerLink="/instructor/courses" class="btn btn--ghost">Manage All →</a>
    </div>

    @if (courses().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">📚</div>
        <h3 class="empty-state__title">No courses yet</h3>
        <p class="empty-state__desc">Create your first course and start teaching!</p>
        <a routerLink="/instructor/courses/new" class="btn btn--primary">Create Course</a>
      </div>
    } @else {
      <div class="grid grid--auto">
        @for (c of courses().slice(0, 4); track c.courseId) {
          <div class="card card--hover">
            <img [src]="c.thumbnailUrl || 'assets/default-course.svg'"
              style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;background:#eef2ff;margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <h4 style="font-size:14px;font-weight:700;flex:1">{{ c.title }}</h4>
              <span class="badge" [class]="c.isPublished ? 'badge--success' : 'badge--muted'">
                {{ c.isPublished ? 'Live' : 'Draft' }}
              </span>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:14px">{{ c.category }} · {{ c.level }}</p>
            <div style="display:flex;gap:8px">
              <a [routerLink]="['/instructor/courses', c.courseId, 'edit']" class="btn btn--outline btn--sm">Edit</a>
              <a [routerLink]="['/instructor/courses', c.courseId, 'lessons']" class="btn btn--ghost btn--sm">Lessons</a>
            </div>
          </div>
        }
      </div>
    }

    <div style="margin-top:32px">
      <h2 class="section-title">Quick Actions</h2>
      <div style="display:flex;flex-wrap:wrap;gap:12px">
        <a routerLink="/instructor/courses/new"    class="btn btn--primary">+ New Course</a>
        <a routerLink="/instructor/courses"        class="btn btn--outline">Manage Courses</a>
        <a routerLink="/instructor/analytics"      class="btn btn--outline">View Analytics</a>
        <a routerLink="/notifications"             class="btn btn--outline">Notifications</a>
      </div>
    </div>
  `,
  styles: [`.welcome-banner{border-radius:16px;padding:28px 32px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px}.welcome-banner h1{font-size:24px;font-weight:800;margin-bottom:4px}.welcome-banner p{opacity:.85}`]
})
export class InstructorDashboardComponent implements OnInit {
  auth           = inject(AuthService);
  courseService  = inject(CourseService);
  enrollService  = inject(EnrollmentService);

  courses          = signal<Course[]>([]);
  totalEnrollments = signal(0);

  published = () => this.courses().filter(c => c.isPublished);

  ngOnInit() {
    const uid = this.auth.user()!.userId;
    this.courseService.getCoursesByInstructor(uid).subscribe(c => {
      this.courses.set(c);
      c.forEach(course => {
        this.enrollService.getEnrollmentCount(course.courseId).subscribe(r => {
          this.totalEnrollments.update(t => t + r.count);
        });
      });
    });
  }
}
