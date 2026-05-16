import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h1 class="page-title">My Courses</h1>
        <p class="page-subtitle">{{ courses().length }} courses</p>
      </div>
      <a routerLink="/instructor/courses/new" class="btn btn--primary">+ Create Course</a>
    </div>

    @if (courses().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">📚</div>
        <h3 class="empty-state__title">No courses yet</h3>
        <a routerLink="/instructor/courses/new" class="btn btn--primary">Create Your First Course</a>
      </div>
    } @else {
      <div class="card" style="padding:0">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of courses(); track c.id) {
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:12px">
                      <img [src]="c.thumbnailUrl || 'assets/default-course.svg'"
                        style="width:48px;height:36px;object-fit:cover;border-radius:6px;background:#eef2ff">
                      <div>
                        <div style="font-weight:600;font-size:14px">{{ c.title }}</div>
                        <div style="font-size:12px;color:var(--text-muted)">{{ c.language }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ c.category }}</td>
                  <td><span class="badge badge--muted">{{ c.level }}</span></td>
                  <td style="font-weight:700">{{ c.price === 0 ? 'Free' : '₹' + c.price }}</td>
                  <td>
                    <span class="badge" [class]="c.published ? 'badge--success' : 'badge--muted'">
                      {{ c.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <a [routerLink]="['/instructor/courses', c.id, 'lessons']" class="btn btn--ghost btn--sm" title="Lessons">📋</a>
                      <a [routerLink]="['/instructor/courses', c.id, 'quizzes']" class="btn btn--ghost btn--sm" title="Quizzes">📝</a>
                      <a [routerLink]="['/instructor/courses', c.id, 'students']" class="btn btn--ghost btn--sm" title="Students">👥</a>
                      <a [routerLink]="['/instructor/courses', c.id, 'edit']" class="btn btn--outline btn--sm">Edit</a>
                      @if (!c.published) {
                        <button class="btn btn--success btn--sm" (click)="publish(c)" [disabled]="acting()">Publish</button>
                      } @else {
                        <button class="btn btn--outline btn--sm" (click)="unpublish(c)" [disabled]="acting()">Unpublish</button>
                      }
                      <button class="btn btn--danger btn--sm" (click)="delete(c)" [disabled]="acting()">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class ManageCoursesComponent implements OnInit {
  courseService = inject(CourseService);
  auth          = inject(AuthService);
  toast         = inject(ToastService);

  courses = signal<Course[]>([]);
  acting  = signal(false);

  ngOnInit() {
    this.courseService.getCoursesByInstructor(this.auth.user()!.userId).subscribe(c => this.courses.set(c));
  }

  publish(c: Course) {
    this.acting.set(true);
    this.courseService.publishCourse(c.id).subscribe({
      next: () => { this.acting.set(false); this.toast.success('Course published!'); this.reload(); },
      error: () => { this.acting.set(false); this.toast.error('Failed to publish'); }
    });
  }

  unpublish(c: Course) {
    this.acting.set(true);
    this.courseService.unpublishCourse(c.id).subscribe({
      next: () => { this.acting.set(false); this.toast.success('Course unpublished'); this.reload(); },
      error: () => { this.acting.set(false); this.toast.error('Failed to unpublish'); }
    });
  }

  delete(c: Course) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    this.acting.set(true);
    this.courseService.deleteCourse(c.id).subscribe({
      next: () => { this.acting.set(false); this.toast.success('Course deleted'); this.reload(); },
      error: () => { this.acting.set(false); this.toast.error('Failed to delete'); }
    });
  }

  reload() {
    this.courseService.getCoursesByInstructor(this.auth.user()!.userId).subscribe(c => this.courses.set(c));
  }
}
