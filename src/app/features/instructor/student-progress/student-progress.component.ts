import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseService } from '../../../core/services/course.service';
import { Enrollment, Course } from '../../../core/models';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="btn btn--ghost" routerLink="/instructor/courses">← Back</button>
      <div>
        <h1 class="page-title" style="margin:0">Student Progress</h1>
        @if (course()) { <p class="page-subtitle" style="margin:0">{{ course()!.title }}</p> }
      </div>
    </div>

    <div class="grid grid--3" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-card__icon">👥</div>
        <div class="stat-card__value">{{ enrollments().length }}</div>
        <div class="stat-card__label">Total Students</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">✅</div>
        <div class="stat-card__value">{{ completed() }}</div>
        <div class="stat-card__label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">📈</div>
        <div class="stat-card__value">{{ avgProgress() }}%</div>
        <div class="stat-card__label">Avg Progress</div>
      </div>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Enrolled</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            @for (e of enrollments(); track e.enrollmentId) {
              <tr>
                <td>Student #{{ e.studentId }}</td>
                <td style="color:var(--text-muted)">{{ e.enrolledAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="progress-bar" style="width:120px">
                      <div class="progress-bar__fill" [style.width.%]="e.progressPercent"></div>
                    </div>
                    <span style="font-size:13px;font-weight:600">{{ e.progressPercent }}%</span>
                  </div>
                </td>
                <td>
                  <span class="badge"
                    [class]="e.status==='COMPLETED'?'badge--success':e.status==='CANCELLED'?'badge--danger':'badge--primary'">
                    {{ e.status }}
                  </span>
                </td>
                <td>
                  @if (e.certificateIssued) {
                    <span class="badge badge--success">🏆 Issued</span>
                  } @else {
                    <span class="badge badge--muted">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StudentProgressComponent implements OnInit {
  route         = inject(ActivatedRoute);
  enrollService = inject(EnrollmentService);
  courseService = inject(CourseService);

  courseId    = 0;
  course      = signal<Course | null>(null);
  enrollments = signal<Enrollment[]>([]);

  completed   = () => this.enrollments().filter(e => e.status === 'COMPLETED').length;
  avgProgress = () => {
    const list = this.enrollments();
    if (!list.length) return 0;
    return Math.round(list.reduce((s, e) => s + e.progressPercent, 0) / list.length);
  };

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(this.courseId).subscribe(c => this.course.set(c));
    this.enrollService.getEnrollmentsByCourse(this.courseId).subscribe(e => this.enrollments.set(e));
  }
}
