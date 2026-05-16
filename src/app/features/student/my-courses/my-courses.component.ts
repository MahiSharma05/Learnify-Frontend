import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment } from '../../../core/models';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h1 class="page-title">My Courses</h1>
    <p class="page-subtitle">Your enrolled courses</p>
    <div class="filter-tabs" style="margin-bottom:24px">
      @for (tab of tabs; track tab) {
        <button class="tab-btn" [class.active]="activeTab === tab" (click)="activeTab = tab">{{ tab }}</button>
      }
    </div>
    @if (filtered().length === 0) {
      <div class="empty-state"><div class="empty-state__icon">📚</div>
        <h3 class="empty-state__title">No courses here</h3>
        <a routerLink="/courses" class="btn btn--primary">Browse Courses</a>
      </div>
    } @else {
      <div class="grid grid--auto">
        @for (e of filtered(); track e.id) {
          <div class="card card--hover" style="display:flex;flex-direction:column;gap:14px">
            <img [src]="e.courseThumbnail || 'assets/default-course.svg'"
              style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:10px;background:#eef2ff">
            <div>
              <h4 style="font-size:15px;font-weight:700;margin-bottom:6px">{{ e.courseTitle || 'Course #' + e.courseId }}</h4>
              <span class="badge" [class]="'badge--' + (e.status==='COMPLETED'?'success':e.status==='CANCELLED'?'danger':'primary')">
                {{ e.status }}
              </span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-muted)">
              <div class="progress-bar" style="flex:1"><div class="progress-bar__fill" [style.width.%]="e.progressPercent"></div></div>
              {{ e.progressPercent }}%
            </div>
            <div style="display:flex;gap:8px">
              <a [routerLink]="['/courses', e.courseId, 'learn']" class="btn btn--primary btn--sm btn--full">
                {{ e.progressPercent === 0 ? 'Start' : 'Continue' }}
              </a>
              @if (e.certificateIssued) {
                <a routerLink="/certificates" class="btn btn--outline btn--sm">🏆</a>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`.filter-tabs{display:flex;gap:8px}.tab-btn{padding:8px 18px;border:1.5px solid var(--border);border-radius:20px;background:none;font-size:13px;font-weight:600;cursor:pointer;color:var(--text-muted)}.tab-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}`]
})
export class MyCoursesComponent implements OnInit {
  enrollService = inject(EnrollmentService);
  enrollments   = signal<Enrollment[]>([]);
  tabs = ['All', 'Active', 'Completed', 'Cancelled'];
  activeTab = 'All';

  filtered() {
    const list = this.enrollments();
    if (this.activeTab === 'All') return list;
    return list.filter(e => e.status.toUpperCase() === this.activeTab.toUpperCase());
  }

  ngOnInit() { this.enrollService.getMyEnrollments().subscribe(e => this.enrollments.set(e)); }
}
