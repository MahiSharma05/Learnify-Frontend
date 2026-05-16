import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment } from '../../../core/models';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-my-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h1 class="page-title">My Progress</h1>
    <p class="page-subtitle">Track your learning progress across all courses</p>

    @if (enrollments().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">📈</div>
        <h3 class="empty-state__title">No progress yet</h3>
        <p class="empty-state__desc">Enroll in courses to start tracking your progress</p>
        <a routerLink="/courses" class="btn btn--primary">Browse Courses</a>
      </div>
    } @else {
      <div class="grid grid--auto">
        @for (e of enrollments(); track e.id) {
          <div class="card">
            <h4 style="font-weight:700;margin-bottom:4px">{{ e.courseTitle || 'Course #' + e.courseId }}</h4>
            <span class="badge badge--muted" style="margin-bottom:16px;display:inline-block">{{ e.status }}</span>
            <div style="text-align:center;margin:16px 0">
              <div style="font-size:48px;font-weight:900;color:var(--primary)">{{ e.progressPercent }}%</div>
              <div style="font-size:13px;color:var(--text-muted)">Complete</div>
            </div>
            <div class="progress-bar" style="margin-bottom:16px">
              <div class="progress-bar__fill"
                [style.width.%]="e.progressPercent"
                [style.background]="e.progressPercent === 100 ? 'var(--success)' : 'var(--primary)'">
              </div>
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
              Enrolled: {{ e.enrolledAt | date:'mediumDate' }}
              @if (e.completedAt) {
                <br>Completed: {{ e.completedAt | date:'mediumDate' }}
              }
            </div>
            <a [routerLink]="['/courses', e.courseId, 'learn']"
               class="btn btn--primary btn--sm btn--full">
              {{ e.progressPercent === 100 ? 'Review Course' : 'Continue Learning' }}
            </a>
          </div>
        }
      </div>
    }
  `
})

export class MyProgressComponent implements OnInit {
  enrollService = inject(EnrollmentService);
  progressService = inject(ProgressService);
  enrollments   = signal<Enrollment[]>([]);
  ngOnInit() {
  this.enrollService.getMyEnrollments().subscribe(enrollments => {
    this.enrollments.set(enrollments);
    enrollments.forEach(e => {
      this.progressService.getCourseProgress(e.courseId).subscribe(res => {
        e.progressPercent = res.percent;   
        this.enrollments.set([...enrollments]);

      });

    });

  });
}
}
