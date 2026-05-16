import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title">Explore Courses</h1>
      <p class="page-subtitle">Discover {{ total() }} courses to advance your career</p>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-wrap">
        <input class="form-control" type="text" [(ngModel)]="keyword"
          placeholder="Search courses..." (input)="onSearch()">
      </div>
      <select class="form-control filter-sel" [(ngModel)]="category" (change)="load()">
        <option value="">All Categories</option>
        @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
      </select>
      <select class="form-control filter-sel" [(ngModel)]="level" (change)="load()">
        <option value="">All Levels</option>
        <option value="BEGINNER">Beginner</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="ADVANCED">Advanced</option>
      </select>
      <select class="form-control filter-sel" [(ngModel)]="sortBy" (change)="applySort()">
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>
      @if (keyword || category || level) {
        <button class="btn btn--outline btn--sm" (click)="clearFilters()">Clear ✕</button>
      }
    </div>

    <app-loading [show]="loading()" message="Loading courses..."></app-loading>

    @if (!loading()) {
      @if (courses().length === 0) {
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No courses found</h3>
          <p class="empty-state__desc">Try adjusting your search or filters</p>
          <button class="btn btn--primary" (click)="clearFilters()">Clear Filters</button>
        </div>
      } @else {
        <div class="grid grid--auto">
          @for (course of courses(); track course.id) {
            <div class="course-card-wrap">
              <div class="course-card" (click)="goToDetail(course.id)">
                <div class="course-card__thumb">
                  <img [src]="course.thumbnailUrl || 'assets/default-course.svg'" [alt]="course.title" loading="lazy">
                  <span class="course-card__level">{{ course.level }}</span>
                </div>
                <div class="course-card__body">
                  <span class="badge badge--primary">{{ course.category }}</span>
                  <h3 class="course-card__title">{{ course.title }}</h3>
                  <p class="course-card__desc">{{ course.description | slice:0:90 }}...</p>
                  <div class="course-card__meta">
                    <span>🌐 {{ course.language || 'English' }}</span>
                    @if (course.totalDuration) { <span>⏱ {{ course.totalDuration }}min</span> }
                  </div>
                  <div class="course-card__footer">
                    <strong class="price">{{ course.price === 0 ? 'Free' : ('₹' + course.price) }}</strong>
                    @if (auth.isLoggedIn()) {
                      @if (isEnrolled(course.id)) {
                        <button class="btn btn--sm btn--success" (click)="$event.stopPropagation(); continueLearning(course.id)">Continue</button>
                      } @else {
                        <button class="btn btn--sm btn--primary" (click)="$event.stopPropagation(); enroll(course)">Enroll Now</button>
                      }
                    } @else {
                      <button class="btn btn--sm btn--outline" (click)="$event.stopPropagation(); router.navigate(['/auth/login'])">Login to Enroll</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    }
  `,
  styles: [`
    .filters-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; align-items: center; }
    .search-wrap { flex: 1; min-width: 200px; }
    .filter-sel  { width: 160px; }
    .course-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform .2s, box-shadow .2s; height: 100%; display: flex; flex-direction: column; }
    .course-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
    .course-card__thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #eef2ff; }
    .course-card__thumb img { width: 100%; height: 100%; object-fit: cover; }
    .course-card__level { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 20px; }
    .course-card__body { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .course-card__title { font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.3; }
    .course-card__desc  { font-size: 13px; color: var(--text-muted); line-height: 1.5; flex: 1; }
    .course-card__meta  { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); }
    .course-card__footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 8px; }
    .price { font-size: 16px; font-weight: 800; color: var(--primary); }
    .course-card-wrap { display: flex; }
  `]
})
export class CourseListComponent implements OnInit {
  courseService    = inject(CourseService);
  enrollService    = inject(EnrollmentService);
  paymentService   = inject(PaymentService);
  auth             = inject(AuthService);
  toast            = inject(ToastService);
  router           = inject(Router);
  route            = inject(ActivatedRoute);

  courses    = signal<Course[]>([]);
  total      = signal(0);
  loading    = signal(true);
  enrolledIds = signal<Set<number>>(new Set());

  keyword  = '';
  category = '';
  level    = '';
  sortBy   = 'newest';

  categories = ['Web Development','Data Science','Mobile Dev','AI & ML','Cloud','DevOps','Design','Business','Security','Blockchain'];

  private searchTimer: any;

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.keyword  = p['keyword']  || '';
      this.category = p['category'] || '';
      this.level    = p['level']    || '';
      this.load();
    });
    if (this.auth.isLoggedIn()) this.loadEnrollments();
  }

  load() {
    this.loading.set(true);
    this.courseService.getAllCourses({
      keyword: this.keyword || undefined,
      category: this.category || undefined,
      level: this.level || undefined,
    }).subscribe({
      next: c => {
        this.courses.set(c); this.total.set(c.length);
        this.applySort(); this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadEnrollments() {
    this.enrollService.getMyEnrollments().subscribe(list => {
      this.enrolledIds.set(new Set(list.map(e => e.courseId)));
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  applySort() {
    const list = [...this.courses()];
    if (this.sortBy === 'price-low')  list.sort((a,b) => a.price - b.price);
    if (this.sortBy === 'price-high') list.sort((a,b) => b.price - a.price);
    this.courses.set(list);
  }

  clearFilters() { this.keyword = ''; this.category = ''; this.level = ''; this.load(); }
  isEnrolled(id: number) { return this.enrolledIds().has(id); }
  goToDetail(id: number)  { this.router.navigate(['/courses', id]); }
  continueLearning(id: number) { this.router.navigate(['/courses', id, 'learn']); }

  enroll(course: any) {
  const id = course.courseId || course.id;

  if (!id) {
    console.error("❌ Course ID missing", course);
    return;
  }

  if (!this.auth.isLoggedIn()) {
    this.router.navigate(['/auth/login']);
    return;
  }

  if (course.price === 0) {

  this.enrollService.enroll(
    id,
    course.title,
    course.thumbnailUrl
  ).subscribe({

    next: () => {

      this.toast.success('Enrolled successfully!');

      this.loadEnrollments();

    },

    error: e =>
      this.toast.error(
        e.error?.message || 'Enrollment failed'
      )
  });
} else {
    this.router.navigate(['/courses', id]);
  }
}
}
