import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { AssessmentService } from '../../../core/services/assessment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course, Lesson, Quiz } from '../../../core/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent, FormsModule],
  template: `
    <app-loading [show]="loading()" [fullscreen]="true"></app-loading>

    @if (course()) {
      <!-- Header -->
      <div class="course-hero">
        <div class="course-hero__content">
          <span class="badge badge--primary">{{ course()!.category }}</span>
          <h1 class="course-hero__title">{{ course()!.title }}</h1>
          <p class="course-hero__desc">{{ course()!.description }}</p>
          <div class="course-hero__meta">
            <span class="badge badge--muted">{{ course()!.level }}</span>
            <span>🌐 {{ course()!.language || 'English' }}</span>
            @if (course()!.totalDuration) { <span>⏱ {{ course()!.totalDuration }} minutes</span> }
            @if (enrollCount() !== null) { <span>👥 {{ enrollCount() }} enrolled</span> }
          </div>
        </div>
        <div class="course-hero__card">
          <div class="course-hero__thumb">
            <img [src]="course()!.thumbnailUrl || 'assets/default-course.svg'" [alt]="course()!.title">
          </div>
          <div class="price-box">
            <div class="price-main">{{ course()!.price === 0 ? 'Free' : ('₹' + course()!.price) }}</div>
            @if (isEnrolled()) {
              <button class="btn btn--success btn--full" [routerLink]="['/courses', course()!.courseId, 'learn']">
                ▶ Continue Learning
              </button>
            } @else if (auth.isLoggedIn()) {
              @if (course()!.price === 0) {
                <button class="btn btn--primary btn--full" (click)="enrollFree()" [disabled]="enrolling()">
                  {{ enrolling() ? 'Enrolling...' : 'Enroll for Free' }}
                </button>
              } @else {
                <button class="btn btn--primary btn--full" (click)="showPayment.set(true)">
                  Purchase Course
                </button>
              }
            } @else {
              <button class="btn btn--primary btn--full" (click)="router.navigate(['/auth/login'])">
                Login to Enroll
              </button>
            }
            <ul class="includes-list">
              <li>✓ {{ lessons().length }} lessons</li>
              <li>✓ {{ quizzes().length }} quizzes</li>
              <li>✓ Downloadable resources</li>
              <li>✓ Certificate on completion</li>
              <li>✓ Lifetime access</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="course-body">
        <!-- Curriculum -->
        <div class="curriculum-card card">
          <h2 class="section-title">Course Curriculum</h2>
          @if (lessons().length === 0) {
            <p style="color:var(--text-muted);font-size:14px">No lessons published yet.</p>
          }
          <div class="lesson-list">
            @for (lesson of lessons(); track lesson.lessonId; let i = $index) {
              <div class="lesson-item" [class.preview]="lesson.isPreview">
                <div class="lesson-item__icon">
                  {{ lesson.contentType === 'VIDEO' ? '▶' : lesson.contentType === 'PDF' ? '📄' : '📝' }}
                </div>
                <div class="lesson-item__info">
                  <span class="lesson-item__title">{{ i + 1 }}. {{ lesson.title }}</span>
                  @if (lesson.durationMinutes) {
                    <span class="lesson-item__dur">{{ lesson.durationMinutes }} min</span>
                  }
                </div>
                @if (lesson.isPreview) {
                  <span class="badge badge--success" style="font-size:11px">Preview</span>
                } @else if (!isEnrolled()) {
                  <span style="color:var(--text-muted);font-size:16px">🔒</span>
                }
              </div>
            }
          </div>

          @if (quizzes().length > 0) {
            <h3 style="font-size:16px;font-weight:700;margin:24px 0 12px">Quizzes</h3>
            @for (quiz of quizzes(); track quiz.quizId) {
              <div class="lesson-item">
                <div class="lesson-item__icon">📝</div>
                <div class="lesson-item__info">
                  <span class="lesson-item__title">{{ quiz.title }}</span>
                  <span class="lesson-item__dur">{{ quiz.timeLimitMinutes }} min · {{ quiz.passingScore }}% to pass</span>
                </div>
                @if (isEnrolled()) {
                  <button class="btn btn--sm btn--outline" [routerLink]="['/quiz', quiz.quizId, 'take']">Start</button>
                } @else {
                  <span style="color:var(--text-muted);font-size:16px">🔒</span>
                }
              </div>
            }
          }
        </div>
      </div>
    }

    <!-- Payment Modal -->
    @if (showPayment()) {
      <div class="modal-overlay" (click)="showPayment.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Purchase Course</h2>
          <p style="color:var(--text-muted);margin:8px 0 20px">{{ course()!.title }}</p>
          <div style="font-size:28px;font-weight:800;margin-bottom:20px">₹{{ course()!.price }}</div>
          <div class="form-group">
            <label class="form-label">Payment Method</label>
            <select class="form-control" [(ngModel)]="payMode">
              <option value="CARD">Credit/Debit Card</option>
              <option value="UPI">UPI</option>
              <option value="WALLET">Wallet</option>
            </select>
          </div>
          <div style="display:flex;gap:10px;margin-top:16px">
            <button class="btn btn--primary btn--full" (click)="buyNow()" [disabled]="enrolling()">
              {{ enrolling() ? 'Processing...' : 'Pay ₹' + course()!.price }}
            </button>
            <button class="btn btn--outline" (click)="showPayment.set(false)">Cancel</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .course-hero { display: grid; grid-template-columns: 1fr 340px; gap: 40px; margin-bottom: 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 48px 32px; border-radius: 20px; }
    .course-hero__title { font-size: 32px; font-weight: 900; line-height: 1.2; margin: 12px 0; }
    .course-hero__desc { font-size: 15px; opacity: .85; line-height: 1.7; margin-bottom: 16px; }
    .course-hero__meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; opacity: .8; }
    .course-hero__thumb { aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
    .course-hero__thumb img { width: 100%; height: 100%; object-fit: cover; }
    .price-box { background: var(--surface); border-radius: 14px; padding: 20px; color: var(--text); }
    .price-main { font-size: 32px; font-weight: 900; margin-bottom: 14px; color: var(--primary); }
    .includes-list { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-top: 16px; font-size: 14px; color: var(--text-muted); }
    .course-body { display: flex; flex-direction: column; gap: 20px; }
    .curriculum-card { }
    .lesson-list { display: flex; flex-direction: column; gap: 2px; }
    .lesson-item { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 8px; }
    .lesson-item:hover { background: var(--bg); }
    .lesson-item__icon { width: 32px; height: 32px; background: var(--primary-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
    .lesson-item__info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .lesson-item__title { font-size: 14px; font-weight: 500; }
    .lesson-item__dur   { font-size: 12px; color: var(--text-muted); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 500; }
    .modal { background: var(--surface); border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; }
    .modal h2 { font-size: 22px; font-weight: 800; }
    @media (max-width: 900px) { .course-hero { grid-template-columns: 1fr; } }
  `]
})
export class CourseDetailComponent implements OnInit {
  route           = inject(ActivatedRoute);
  router          = inject(Router);
  courseService   = inject(CourseService);
  lessonService   = inject(LessonService);
  enrollService   = inject(EnrollmentService);
  assessService   = inject(AssessmentService);
  paymentService  = inject(PaymentService);
  auth            = inject(AuthService);
  toast           = inject(ToastService);

  course      = signal<Course | null>(null);
  lessons     = signal<Lesson[]>([]);
  quizzes     = signal<Quiz[]>([]);
  loading     = signal(true);
  enrolling   = signal(false);
  isEnrolled  = signal(false);
  showPayment = signal(false);
  enrollCount = signal<number | null>(null);
  payMode     = 'CARD';

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(id).subscribe(c => {
      this.course.set(c);
      this.lessonService.getLessonsByCourse(id).subscribe(l => this.lessons.set(l));
      this.assessService.getQuizzesByCourse(id).subscribe(q => this.quizzes.set(q));
      this.enrollService.getEnrollmentCount(id).subscribe(r => this.enrollCount.set(r.count));
      if (this.auth.isLoggedIn()) {
        this.enrollService.isEnrolled(id).subscribe(r => this.isEnrolled.set(r.enrolled));
      }
      this.loading.set(false);
    });
  }

  enrollFree() {
    this.enrolling.set(true);
    this.enrollService.enroll(this.course()!.courseId).subscribe({
      next: () => { this.enrolling.set(false); this.isEnrolled.set(true); this.toast.success('Enrolled successfully!'); },
      error: e  => { this.enrolling.set(false); this.toast.error(e.error?.message || 'Enrollment failed'); }
    });
  }

  buyNow() {
    this.enrolling.set(true);
    this.paymentService.processPayment({
      courseId: this.course()!.courseId,
      amount: this.course()!.price,
      mode: this.payMode,
      currency: 'INR',
    }).subscribe({
      next: () => {
        this.enrollService.enroll(this.course()!.courseId).subscribe({
          next: () => {
            this.enrolling.set(false); this.showPayment.set(false);
            this.isEnrolled.set(true);
            this.toast.success('Payment successful! You are enrolled.');
          }
        });
      },
      error: e => { this.enrolling.set(false); this.toast.error(e.error?.message || 'Payment failed'); }
    });
  }
}
