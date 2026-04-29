import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LessonService } from '../../../core/services/lesson.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { Lesson, Course } from '../../../core/models';

@Component({
  selector: 'app-manage-lessons',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="btn btn--ghost" routerLink="/instructor/courses">← Back</button>
      <div>
        <h1 class="page-title" style="margin:0">Manage Lessons</h1>
        @if (course()) { <p class="page-subtitle" style="margin:0">{{ course()!.title }}</p> }
      </div>
    </div>

    <div class="lessons-layout">
      <!-- Lesson Form -->
      <div class="card">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">
          {{ editing() ? 'Edit Lesson' : 'Add Lesson' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="saveLesson()">
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input class="form-control" formControlName="title" placeholder="Lesson title">
          </div>
          <div class="form-group">
            <label class="form-label">Content Type</label>
            <select class="form-control" formControlName="contentType">
              <option value="VIDEO">Video</option>
              <option value="ARTICLE">Article</option>
              <option value="PDF">PDF</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Content URL *</label>
            <input class="form-control" formControlName="contentUrl" placeholder="https://...">
          </div>
          <div class="form-group">
            <label class="form-label">Duration (minutes)</label>
            <input class="form-control" type="number" formControlName="durationMinutes" min="1">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" formControlName="description" rows="2"></textarea>
          </div>
          <div class="form-group" style="flex-direction:row;align-items:center;gap:10px">
            <input type="checkbox" formControlName="isPreview" id="preview">
            <label for="preview" class="form-label" style="margin:0">Free Preview Lesson</label>
          </div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button class="btn btn--primary btn--full" type="submit" [disabled]="saving()">
              {{ saving() ? 'Saving...' : editing() ? 'Update' : 'Add Lesson' }}
            </button>
            @if (editing()) {
              <button type="button" class="btn btn--outline" (click)="cancelEdit()">Cancel</button>
            }
          </div>
        </form>
      </div>

      <!-- Lesson List -->
      <div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:14px">
          {{ lessons().length }} Lessons
        </h3>
        @if (lessons().length === 0) {
          <div class="empty-state"><div class="empty-state__icon">📋</div>
            <p class="empty-state__desc">No lessons yet. Add your first lesson.</p>
          </div>
        }
        <div style="display:flex;flex-direction:column;gap:10px">
          @for (l of lessons(); track l.lessonId; let i = $index) {
            <div class="lesson-row">
              <div class="lesson-row__drag">⠿</div>
              <div class="lesson-row__num">{{ i + 1 }}</div>
              <div class="lesson-row__icon">
                {{ l.contentType === 'VIDEO' ? '▶' : l.contentType === 'PDF' ? '📄' : '📝' }}
              </div>
              <div class="lesson-row__info">
                <span style="font-size:14px;font-weight:600">{{ l.title }}</span>
                <span style="font-size:12px;color:var(--text-muted)">{{ l.durationMinutes }}min · {{ l.contentType }}</span>
              </div>
              @if (l.isPreview) { <span class="badge badge--success" style="font-size:11px">Preview</span> }
              <div style="display:flex;gap:6px;margin-left:auto">
                <button class="btn btn--ghost btn--sm" (click)="editLesson(l)">✏️</button>
                <button class="btn btn--danger btn--sm" (click)="deleteLesson(l.lessonId)">✕</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .lessons-layout { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: flex-start; }
    .lesson-row { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; }
    .lesson-row__drag { color: var(--text-muted); cursor: grab; font-size: 18px; }
    .lesson-row__num  { width: 24px; height: 24px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .lesson-row__icon { font-size: 18px; width: 32px; text-align: center; }
    .lesson-row__info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    @media (max-width: 900px) { .lessons-layout { grid-template-columns: 1fr; } }
  `]
})
export class ManageLessonsComponent implements OnInit {
  route         = inject(ActivatedRoute);
  lessonService = inject(LessonService);
  courseService = inject(CourseService);
  toast         = inject(ToastService);
  fb            = inject(FormBuilder);

  courseId = 0;
  course   = signal<Course | null>(null);
  lessons  = signal<Lesson[]>([]);
  editing  = signal<Lesson | null>(null);
  saving   = signal(false);

  form = this.fb.group({
    title:          ['', Validators.required],
    contentType:    ['VIDEO'],
    contentUrl:     ['', Validators.required],
    durationMinutes:[15, Validators.min(1)],
    description:    [''],
    isPreview:      [false],
  });

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(this.courseId).subscribe(c => this.course.set(c));
    this.loadLessons();
  }

  loadLessons() {
    this.lessonService.getLessonsByCourse(this.courseId).subscribe(l => this.lessons.set(l));
  }

  saveLesson() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const payload = { ...this.form.value, courseId: this.courseId, orderIndex: this.lessons().length + 1 } as any;
    const obs = this.editing()
      ? this.lessonService.updateLesson(this.editing()!.lessonId, payload)
      : this.lessonService.addLesson(payload);

    obs.subscribe({
      next: () => {
        this.saving.set(false); this.form.reset({ contentType: 'VIDEO', durationMinutes: 15, isPreview: false });
        this.editing.set(null); this.toast.success('Lesson saved!'); this.loadLessons();
      },
      error: () => { this.saving.set(false); this.toast.error('Failed to save lesson'); }
    });
  }

  editLesson(l: Lesson) {
    this.editing.set(l);
    this.form.patchValue(l as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() { this.editing.set(null); this.form.reset({ contentType: 'VIDEO', durationMinutes: 15, isPreview: false }); }

  deleteLesson(id: number) {
    if (!confirm('Delete this lesson?')) return;
    this.lessonService.deleteLesson(id).subscribe(() => { this.toast.success('Lesson deleted'); this.loadLessons(); });
  }
}
