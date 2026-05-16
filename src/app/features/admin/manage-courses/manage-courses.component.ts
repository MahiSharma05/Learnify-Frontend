import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-admin-manage-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <h1 class="page-title">Manage Courses</h1>
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <input class="form-control" style="max-width:280px" [(ngModel)]="search"
        placeholder="Search courses..." (input)="filterCourses()">
      <select class="form-control" style="width:160px" [(ngModel)]="statusFilter" (change)="filterCourses()">
        <option value="">All Status</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Course</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (c of filtered(); track c.id) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:12px">
                    <img [src]="c.thumbnailUrl || 'assets/default-course.svg'"
                      style="width:48px;height:36px;object-fit:cover;border-radius:6px;background:#eef2ff">
                    <div>
                      <div style="font-weight:600;font-size:14px">{{ c.title }}</div>
                      <div style="font-size:12px;color:var(--text-muted)">{{ c.level }} · Inst. #{{ c.instructorId }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ c.category }}</td>
                <td style="font-weight:700">{{ c.price === 0 ? 'Free' : '₹' + c.price }}</td>
                <td>
                  <span class="badge" [class]="c.published ? 'badge--success' : 'badge--warning'">
                    {{ c.published ? 'Published' : 'Pending' }}
                  </span>
                </td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a [routerLink]="['/courses', c.id]" class="btn btn--ghost btn--sm">View</a>
                    @if (!c.published) {
                      <button class="btn btn--success btn--sm" (click)="approve(c.id)">✓ Approve</button>
                      <button class="btn btn--danger btn--sm"  (click)="reject(c.id)">✗ Reject</button>
                    } @else {
                      <button class="btn btn--outline btn--sm" (click)="unpublish(c.id)">Unpublish</button>
                    }
                    <button class="btn btn--danger btn--sm" (click)="deleteCourse(c)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminManageCoursesComponent implements OnInit {
  courseService = inject(CourseService);
  toast         = inject(ToastService);

  allCourses = signal<Course[]>([]);
  filtered   = signal<Course[]>([]);
  search     = '';
  statusFilter = '';

  ngOnInit() {
    this.courseService.getAllCourses().subscribe(c => { this.allCourses.set(c); this.filtered.set(c); });
  }

  filterCourses() {
    const s = this.search.toLowerCase();
    this.filtered.set(this.allCourses().filter(c => {
      const matchSearch = !s || c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s);
      const matchStatus = !this.statusFilter ||
        (this.statusFilter === 'published' && c.published) ||
        (this.statusFilter === 'draft' && !c.published);
      return matchSearch && matchStatus;
    }));
  }

  approve(id: number)   { this.courseService.approveCourse(id).subscribe(() => { this.toast.success('Course approved'); this.ngOnInit(); }); }
  reject(id: number)    { this.courseService.rejectCourse(id).subscribe(() => { this.toast.warning('Course rejected'); this.ngOnInit(); }); }
  unpublish(id: number) { this.courseService.unpublishCourse(id).subscribe(() => { this.toast.info('Course unpublished'); this.ngOnInit(); }); }

  deleteCourse(c: Course) {
    if (!confirm(`Delete "${c.title}"?`)) return;
    this.courseService.deleteCourse(c.id).subscribe({
      next: () => { this.toast.success('Course deleted'); this.allCourses.update(list => list.filter(x => x.id !== c.id)); this.filterCourses(); },
      error: () => this.toast.error('Failed to delete course')
    });
  }
}
