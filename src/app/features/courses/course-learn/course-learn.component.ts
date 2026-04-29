import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LessonService } from '../../../core/services/lesson.service';
import { ProgressService } from '../../../core/services/progress.service';
import { CourseService } from '../../../core/services/course.service';
import { AssessmentService } from '../../../core/services/assessment.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Lesson, Quiz, Course } from '../../../core/models';

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="learn-layout">
      <!-- Sidebar: lesson list -->
      <aside class="learn-sidebar">
        <div class="learn-sidebar__header">
          <button class="btn btn--ghost" (click)="router.navigate(['/courses', courseId])">← Back</button>
          <h3>{{ course()?.title }}</h3>
        </div>
        <div class="progress-info">
          <span>Progress: {{ progress() }}%</span>
          <div class="progress-bar"><div class="progress-bar__fill" [style.width.%]="progress()"></div></div>
        </div>
        <div class="lesson-nav">
          @for (lesson of lessons(); track lesson.lessonId; let i = $index) {
            <div class="lesson-nav__item" [class.active]="current()?.lessonId === lesson.lessonId"
              [class.done]="completedIds().has(lesson.lessonId)"
              (click)="selectLesson(lesson)">
              <span class="lesson-nav__num">
                {{ completedIds().has(lesson.lessonId) ? '✓' : i + 1 }}
              </span>
              <div class="lesson-nav__info">
                <span>{{ lesson.title }}</span>
                <small>{{ lesson.contentType }} · {{ lesson.durationMinutes }}min</small>
              </div>
            </div>
          }
        </div>
        @if (quizzes().length > 0) {
          <div class="quiz-section">
            <h4>Quizzes</h4>
            @for (q of quizzes(); track q.quizId) {
              <button class="btn btn--outline btn--sm btn--full" style="margin-bottom:8px"
                [routerLink]="['/quiz', q.quizId, 'take']">
                📝 {{ q.title }}
              </button>
            }
          </div>
        }
        @if (progress() === 100) {
          <div style="padding:16px">
            <button class="btn btn--success btn--full" (click)="getCertificate()">
              🏆 Get Certificate
            </button>
          </div>
        }
      </aside>

      <!-- Main: video/content player -->
      <main class="learn-main">
        @if (current()) {
          <div class="player-header">
            <h2>{{ current()!.title }}</h2>
            <span class="badge badge--muted">{{ current()!.contentType }}</span>
          </div>

          <div class="player-area">
            @if (current()!.contentType === 'VIDEO') {
              @if (isYoutube(current()!.contentUrl)) {
                <iframe class="video-player" [src]="safeYoutubeUrl(current()!.contentUrl)"
                  frameborder="0" allowfullscreen></iframe>
              } @else {
                <video class="video-player" [src]="current()!.contentUrl" controls
                  (timeupdate)="onTimeUpdate($event)"></video>
              }
            } @else if (current()!.contentType === 'PDF') {
              <iframe class="pdf-player" [src]="current()!.contentUrl" frameborder="0"></iframe>
            } @else {
              <div class="article-player">
                <p style="color:var(--text-muted)">Article content: <a [href]="current()!.contentUrl" target="_blank">Open →</a></p>
              </div>
            }
          </div>

          <div class="player-controls">
            <div>
              @if (current()!.description) {
                <p style="font-size:14px;color:var(--text-muted)">{{ current()!.description }}</p>
              }
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn btn--outline btn--sm" (click)="prevLesson()" [disabled]="isFirst()">← Previous</button>
              @if (!completedIds().has(current()!.lessonId)) {
                <button class="btn btn--primary btn--sm" (click)="markComplete(current()!)">
                  Mark Complete ✓
                </button>
              } @else {
                <span class="badge badge--success">Completed ✓</span>
              }
              <button class="btn btn--outline btn--sm" (click)="nextLesson()" [disabled]="isLast()">Next →</button>
            </div>
          </div>
        } @else {
          <div class="empty-state" style="margin-top:80px">
            <div class="empty-state__icon">📚</div>
            <h3 class="empty-state__title">Select a lesson to begin</h3>
            <p class="empty-state__desc">Choose a lesson from the sidebar to start learning</p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .learn-layout { display: flex; height: calc(100vh - 64px); margin: -28px -32px; overflow: hidden; }
    .learn-sidebar { width: 300px; border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; background: var(--surface); }
    .learn-sidebar__header { padding: 16px; border-bottom: 1px solid var(--border); }
    .learn-sidebar__header h3 { font-size: 14px; font-weight: 700; margin-top: 8px; color: var(--text); }
    .progress-info { padding: 12px 16px; font-size: 13px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px; border-bottom: 1px solid var(--border); }
    .lesson-nav { flex: 1; overflow-y: auto; padding: 8px; }
    .lesson-nav__item { display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: 8px; cursor: pointer; transition: background .15s; }
    .lesson-nav__item:hover { background: var(--bg); }
    .lesson-nav__item.active { background: var(--primary-light); }
    .lesson-nav__item.done .lesson-nav__num { background: var(--success); color: #fff; }
    .lesson-nav__num { width: 24px; height: 24px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
    .lesson-nav__info { display: flex; flex-direction: column; gap: 2px; }
    .lesson-nav__info span { font-size: 13px; font-weight: 500; color: var(--text); }
    .lesson-nav__info small { font-size: 11px; color: var(--text-muted); }
    .quiz-section { padding: 16px; border-top: 1px solid var(--border); }
    .quiz-section h4 { font-size: 13px; font-weight: 700; margin-bottom: 10px; color: var(--text-muted); text-transform: uppercase; }
    .learn-main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .player-header { padding: 20px 24px 12px; display: flex; align-items: center; gap: 14px; }
    .player-header h2 { font-size: 20px; font-weight: 700; flex: 1; }
    .player-area { padding: 0 24px; }
    .video-player { width: 100%; aspect-ratio: 16/9; border-radius: 12px; background: #000; }
    .pdf-player   { width: 100%; height: 600px; border-radius: 12px; }
    .article-player { background: var(--bg); border-radius: 12px; padding: 32px; min-height: 300px; }
    .player-controls { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); margin-top: 16px; }
    @media (max-width: 768px) { .learn-sidebar { display: none; } .learn-layout { flex-direction: column; } }
  `]
})
export class CourseLearnComponent implements OnInit {
  route           = inject(ActivatedRoute);
  router          = inject(Router);
  lessonService   = inject(LessonService);
  progressService = inject(ProgressService);
  courseService   = inject(CourseService);
  assessService   = inject(AssessmentService);
  enrollService   = inject(EnrollmentService);
  toast           = inject(ToastService);

  courseId   = 0;
  course     = signal<Course | null>(null);
  lessons    = signal<Lesson[]>([]);
  quizzes    = signal<Quiz[]>([]);
  current    = signal<Lesson | null>(null);
  completedIds = signal<Set<number>>(new Set());
  progress   = signal(0);

  get isFirst() { return () => this.lessons().indexOf(this.current()!) === 0; }
  get isLast()  { return () => this.lessons().indexOf(this.current()!) === this.lessons().length - 1; }

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(this.courseId).subscribe(c => this.course.set(c));
    this.lessonService.getLessonsByCourse(this.courseId).subscribe(l => {
      this.lessons.set(l);
      if (l.length > 0) this.current.set(l[0]);
    });
    this.assessService.getQuizzesByCourse(this.courseId).subscribe(q => this.quizzes.set(q));
    this.progressService.getCourseProgress(this.courseId).subscribe(r => this.progress.set(r.percent));
    this.progressService.getAllProgressByCourse(this.courseId).subscribe(list => {
      this.completedIds.set(new Set(list.filter(p => p.isCompleted).map(p => p.lessonId)));
    });
  }

  selectLesson(lesson: Lesson) {
    this.current.set(lesson);
    this.progressService.trackProgress(this.courseId, lesson.lessonId, 0).subscribe();
  }

  markComplete(lesson: Lesson) {
    this.progressService.markLessonComplete(this.courseId, lesson.lessonId).subscribe(() => {
      const ids = new Set(this.completedIds());
      ids.add(lesson.lessonId);
      this.completedIds.set(ids);
      this.progressService.getCourseProgress(this.courseId).subscribe(r => this.progress.set(r.percent));
      this.toast.success('Lesson completed!');
      if (this.progress() === 100) {
        this.toast.success('🎉 Course completed! You can now get your certificate!');
      }
    });
  }

  prevLesson() {
    const i = this.lessons().indexOf(this.current()!);
    if (i > 0) this.selectLesson(this.lessons()[i - 1]);
  }
  nextLesson() {
    const i = this.lessons().indexOf(this.current()!);
    if (i < this.lessons().length - 1) this.selectLesson(this.lessons()[i + 1]);
  }

  getCertificate() {
    this.progressService.issueCertificate(this.courseId).subscribe({
      next: () => { this.toast.success('Certificate issued!'); this.router.navigate(['/certificates']); },
      error: e  => this.toast.error(e.error?.message || 'Could not issue certificate')
    });
  }

  isYoutube(url: string) { return url?.includes('youtube.com') || url?.includes('youtu.be'); }
  safeYoutubeUrl(url: string) {
    const id = url?.includes('watch?v=') ? url.split('watch?v=')[1].split('&')[0] : url?.split('/').pop();
    return `https://www.youtube.com/embed/${id}`;
  }
  onTimeUpdate(e: any) {
    const sec = Math.floor(e.target.currentTime);
    if (sec % 30 === 0 && sec > 0 && this.current()) {
      this.progressService.trackProgress(this.courseId, this.current()!.lessonId, sec).subscribe();
    }
  }
}
