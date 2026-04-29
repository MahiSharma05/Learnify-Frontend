import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
      <button class="btn btn--ghost" routerLink="/instructor/courses">← Back</button>
      <h1 class="page-title" style="margin:0">{{ isEdit ? 'Edit Course' : 'Create New Course' }}</h1>
    </div>

    <div class="card" style="max-width:760px">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="grid grid--2">
          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Course Title *</label>
            <input class="form-control" formControlName="title" placeholder="e.g. Complete JavaScript Bootcamp">
            @if (form.get('title')?.touched && form.get('title')?.errors) {
              <span class="form-error">Title is required</span>
            }
          </div>

          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Description *</label>
            <textarea class="form-control" formControlName="description" rows="4"
              placeholder="Describe what students will learn..."></textarea>
            @if (form.get('description')?.touched && form.get('description')?.errors) {
              <span class="form-error">Description is required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Category *</label>
            <select class="form-control" formControlName="category">
              <option value="">Select category</option>
              @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Level *</label>
            <select class="form-control" formControlName="level">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Price (₹) *</label>
            <input class="form-control" type="number" formControlName="price" placeholder="0 for free" min="0">
          </div>

          <div class="form-group">
            <label class="form-label">Language</label>
            <select class="form-control" formControlName="language">
              @for (l of languages; track l) { <option [value]="l">{{ l }}</option> }
            </select>
          </div>

          <div class="form-group" style="grid-column:1/-1">
            <label class="form-label">Thumbnail URL</label>
            <input class="form-control" formControlName="thumbnailUrl" placeholder="https://...">
            @if (form.value.thumbnailUrl) {
              <img [src]="form.value.thumbnailUrl" style="margin-top:10px;width:200px;height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--border)" (error)="clearThumb()">
            }
          </div>
        </div>

        @if (error()) {
          <div class="auth-error" style="margin-bottom:16px">{{ error() }}</div>
        }

        <div style="display:flex;gap:12px">
          <button class="btn btn--primary" type="submit" [disabled]="saving()">
            {{ saving() ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course' }}
          </button>
          <button class="btn btn--outline" type="button" routerLink="/instructor/courses">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`.auth-error{background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:8px;font-size:14px}`]
})
export class CourseFormComponent implements OnInit {
  route         = inject(ActivatedRoute);
  router        = inject(Router);
  courseService = inject(CourseService);
  auth          = inject(AuthService);
  toast         = inject(ToastService);
  fb            = inject(FormBuilder);

  isEdit = false;
  courseId = 0;
  saving = signal(false);
  error  = signal('');

  categories = ['Web Development','Data Science','Mobile Dev','AI & ML','Cloud','DevOps','Design','Business','Security','Blockchain'];
  languages  = ['English','Hindi','Tamil','Telugu','Marathi','Bengali','Gujarati'];

  form = this.fb.group({
    title:        ['', Validators.required],
    description:  ['', Validators.required],
    category:     ['', Validators.required],
    level:        ['BEGINNER', Validators.required],
    price:        [0, [Validators.required, Validators.min(0)]],
    language:     ['English'],
    thumbnailUrl: [''],
  });

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    if (this.courseId) {
      this.isEdit = true;
      this.courseService.getCourseById(this.courseId).subscribe(c => this.form.patchValue(c as any));
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set('');
    const obs = this.isEdit
      ? this.courseService.updateCourse(this.courseId, this.form.value as any)
      : this.courseService.createCourse(this.form.value as any);

    obs.subscribe({
      next: c => {
        this.saving.set(false);
        this.toast.success(this.isEdit ? 'Course updated!' : 'Course created!');
        this.router.navigate(['/instructor/courses', c.courseId, 'lessons']);
      },
      error: e => { this.saving.set(false); this.error.set(e.error?.message || 'Failed to save course'); }
    });
  }

  clearThumb() { this.form.patchValue({ thumbnailUrl: '' }); }
}
