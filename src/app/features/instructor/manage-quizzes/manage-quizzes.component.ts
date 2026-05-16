import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AssessmentService } from '../../../core/services/assessment.service';
import { CourseService } from '../../../core/services/course.service';
import { ToastService } from '../../../core/services/toast.service';
import { Quiz, Question, Course } from '../../../core/models';

@Component({
  selector: 'app-manage-quizzes',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="btn btn--ghost" routerLink="/instructor/courses">← Back</button>
      <div>
        <h1 class="page-title" style="margin:0">Manage Quizzes</h1>
        @if (course()) { <p class="page-subtitle" style="margin:0">{{ course()!.title }}</p> }
      </div>
    </div>

    <div class="quiz-layout">
      <!-- Left: Quiz list -->
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3 style="font-size:16px;font-weight:700">Quizzes ({{ quizzes().length }})</h3>
          <button class="btn btn--primary btn--sm" (click)="showQuizForm.set(true);selectedQuiz.set(null);qForm.reset({timeLimitMinutes:30,passingScore:60,maxAttempts:3})">
            + Add Quiz
          </button>
        </div>

        @if (quizzes().length === 0) {
          <div class="empty-state" style="padding:40px 20px">
            <div class="empty-state__icon">📝</div>
            <p class="empty-state__desc">No quizzes yet</p>
          </div>
        }

        @for (q of quizzes(); track q.id) {
          <div class="quiz-item" [class.active]="selectedQuiz()?.id === q.id" (click)="selectQuiz(q)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <h4 style="font-size:14px;font-weight:700">{{ q.title }}</h4>
                <p style="font-size:12px;color:var(--text-muted)">
                  {{ q.timeLimitMinutes }}min · Pass: {{ q.passingScore }}% · Max: {{ q.maxAttempts }} attempts
                </p>
              </div>
              <span class="badge" [class]="q.isPublished ? 'badge--success' : 'badge--muted'">
                {{ q.isPublished ? 'Live' : 'Draft' }}
              </span>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button class="btn btn--ghost btn--sm" (click)="$event.stopPropagation();editQuiz(q)">✏️ Edit</button>
              @if (!q.isPublished) {
                <button class="btn btn--success btn--sm" (click)="$event.stopPropagation();publishQuiz(q.id)">Publish</button>
              }
              <button class="btn btn--danger btn--sm" (click)="$event.stopPropagation();deleteQuiz(q.id)">Delete</button>
            </div>
          </div>
        }
      </div>

      <!-- Right: Quiz form or Questions -->
      <div>
        @if (showQuizForm()) {
          <div class="card">
            <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">{{ selectedQuiz() ? 'Edit Quiz' : 'New Quiz' }}</h3>
            <form [formGroup]="qForm" (ngSubmit)="saveQuiz()">
              <div class="form-group">
                <label class="form-label">Quiz Title *</label>
                <input class="form-control" formControlName="title" placeholder="e.g. Module 1 Assessment">
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" formControlName="description" rows="2"></textarea>
              </div>
              <div class="grid grid--2">
                <div class="form-group">
                  <label class="form-label">Time Limit (minutes)</label>
                  <input class="form-control" type="number" formControlName="timeLimitMinutes" min="5">
                </div>
                <div class="form-group">
                  <label class="form-label">Passing Score (%)</label>
                  <input class="form-control" type="number" formControlName="passingScore" min="1" max="100">
                </div>
                <div class="form-group">
                  <label class="form-label">Max Attempts</label>
                  <input class="form-control" type="number" formControlName="maxAttempts" min="1">
                </div>
              </div>
              <div style="display:flex;gap:10px">
                <button class="btn btn--primary" type="submit" [disabled]="savingQuiz()">
                  {{ savingQuiz() ? 'Saving...' : 'Save Quiz' }}
                </button>
                <button class="btn btn--outline" type="button" (click)="showQuizForm.set(false)">Cancel</button>
              </div>
            </form>
          </div>
        }

        @if (selectedQuiz() && !showQuizForm()) {
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
              <h3 style="font-size:16px;font-weight:700">Questions ({{ questions().length }})</h3>
              <button class="btn btn--primary btn--sm" (click)="showQForm.set(true)">+ Add Question</button>
            </div>

            @if (showQForm()) {
              <div style="background:var(--bg);border-radius:12px;padding:16px;margin-bottom:16px">
                <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">New Question</h4>
                <form [formGroup]="questionForm" (ngSubmit)="addQuestion()">
                  <div class="form-group">
                    <label class="form-label">Question Text *</label>
                    <textarea class="form-control" formControlName="text" rows="2"></textarea>
                  </div>
                  <div class="grid grid--2">
                    <div class="form-group">
                      <label class="form-label">Type</label>
                      <select class="form-control" formControlName="type" (change)="onTypeChange()">
                        <option value="MCQ">Multiple Choice</option>
                        <option value="TRUE_FALSE">True/False</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Marks</label>
                      <input class="form-control" type="number" formControlName="marks" min="1">
                    </div>
                  </div>
                  @if (questionForm.value.type === 'MCQ') {
                    <div class="form-group">
                      <label class="form-label">Options (one per line)</label>
                      <textarea class="form-control" formControlName="optionsText" rows="4"
                        placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"></textarea>
                    </div>
                  }
                  <div class="form-group">
                    <label class="form-label">Correct Answer</label>
                    <input class="form-control" formControlName="correctAnswer"
                      [placeholder]="questionForm.value.type === 'TRUE_FALSE' ? 'TRUE or FALSE' : 'Exact text of correct option'">
                  </div>
                  <div style="display:flex;gap:10px">
                    <button class="btn btn--primary btn--sm" type="submit" [disabled]="savingQ()">
                      {{ savingQ() ? 'Adding...' : 'Add Question' }}
                    </button>
                    <button class="btn btn--outline btn--sm" type="button" (click)="showQForm.set(false)">Cancel</button>
                  </div>
                </form>
              </div>
            }

            @for (q of questions(); track q.id; let i = $index) {
              <div class="question-row">
                <div class="question-row__num">{{ i + 1 }}</div>
                <div class="question-row__body">
                  <p style="font-size:14px;font-weight:600">{{ q.text }}</p>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:4px">
                    {{ q.type }} · {{ q.marks }} mark{{ q.marks > 1 ? 's' : '' }} · Answer: <strong>{{ q.correctAnswer }}</strong>
                  </div>
                  @if (q.options.length) {
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
                      @for (opt of q.options; track opt) {
                        <span class="badge badge--muted">{{ opt }}</span>
                      }
                    </div>
                  }
                </div>
                <button class="btn btn--danger btn--sm" (click)="deleteQuestion(q.id)">✕</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .quiz-layout { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: flex-start; }
    .quiz-item { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px; cursor: pointer; margin-bottom: 10px; transition: border-color .15s; }
    .quiz-item.active { border-color: var(--primary); background: var(--primary-light); }
    .quiz-item:hover  { border-color: var(--primary); }
    .question-row { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-bottom: 1px solid var(--border); }
    .question-row:last-child { border: none; }
    .question-row__num { width: 28px; height: 28px; border-radius: 50%; background: var(--primary-light); color: var(--primary); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .question-row__body { flex: 1; }
    @media (max-width: 900px) { .quiz-layout { grid-template-columns: 1fr; } }
  `]
})
export class ManageQuizzesComponent implements OnInit {
  route       = inject(ActivatedRoute);
  assessSvc   = inject(AssessmentService);
  courseService= inject(CourseService);
  toast       = inject(ToastService);
  fb          = inject(FormBuilder);

  courseId     = 0;
  course       = signal<Course | null>(null);
  quizzes      = signal<Quiz[]>([]);
  questions    = signal<Question[]>([]);
  selectedQuiz = signal<Quiz | null>(null);
  showQuizForm = signal(false);
  showQForm    = signal(false);
  savingQuiz   = signal(false);
  savingQ      = signal(false);

  qForm = this.fb.group({
    title:           ['', Validators.required],
    description:     [''],
    timeLimitMinutes:[30, Validators.required],
    passingScore:    [60, Validators.required],
    maxAttempts:     [3,  Validators.required],
  });

  questionForm = this.fb.group({
    text:          ['', Validators.required],
    type:          ['MCQ'],
    optionsText:   [''],
    correctAnswer: ['', Validators.required],
    marks:         [1, Validators.min(1)],
  });

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.courseService.getCourseById(this.courseId).subscribe(c => this.course.set(c));
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.assessSvc.getQuizzesByCourse(this.courseId).subscribe(q => this.quizzes.set(q));
  }

  selectQuiz(q: Quiz) {
    this.selectedQuiz.set(q);
    this.showQuizForm.set(false);
    this.assessSvc.getQuestions(q.id).subscribe(qs => this.questions.set(qs));
  }

  editQuiz(q: Quiz) {
    this.selectedQuiz.set(q);
    this.showQuizForm.set(true);
    this.qForm.patchValue(q as any);
  }

  saveQuiz() {
    if (this.qForm.invalid) { this.qForm.markAllAsTouched(); return; }
    this.savingQuiz.set(true);
    const payload = { ...this.qForm.value, courseId: this.courseId } as any;
    const obs = this.selectedQuiz()
      ? this.assessSvc.updateQuiz(this.selectedQuiz()!.id, payload)
      : this.assessSvc.createQuiz(payload);
    obs.subscribe({
      next: q => {
        this.savingQuiz.set(false); this.showQuizForm.set(false);
        this.toast.success('Quiz saved!'); this.loadQuizzes();
        this.selectQuiz(q);
      },
      error: () => { this.savingQuiz.set(false); this.toast.error('Failed to save quiz'); }
    });
  }

  publishQuiz(id: number) {
    this.assessSvc.publishQuiz(id).subscribe(() => { this.toast.success('Quiz published!'); this.loadQuizzes(); });
  }

  deleteQuiz(id: number) {
    if (!confirm('Delete this quiz?')) return;
    this.assessSvc.deleteQuiz(id).subscribe(() => {
      this.toast.success('Quiz deleted'); this.selectedQuiz.set(null); this.loadQuizzes();
    });
  }

  onTypeChange() {
    if (this.questionForm.value.type === 'TRUE_FALSE') {
      this.questionForm.patchValue({ optionsText: 'TRUE\nFALSE' });
    }
  }

  addQuestion() {
    if (this.questionForm.invalid) { this.questionForm.markAllAsTouched(); return; }
    this.savingQ.set(true);
    const v = this.questionForm.value;
    const options = v.type === 'TRUE_FALSE'
      ? ['TRUE', 'FALSE']
      : (v.optionsText || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      text: v.text!, type: v.type!, options,
      correctAnswer: v.correctAnswer!, marks: v.marks!,
      orderIndex: this.questions().length + 1
    };
    this.assessSvc.addQuestion(this.selectedQuiz()!.id, payload).subscribe({
      next: () => {
        this.savingQ.set(false); this.showQForm.set(false); this.questionForm.reset({ type: 'MCQ', marks: 1 });
        this.toast.success('Question added!'); this.assessSvc.getQuestions(this.selectedQuiz()!.id).subscribe(q => this.questions.set(q));
      },
      error: () => { this.savingQ.set(false); this.toast.error('Failed to add question'); }
    });
  }

  deleteQuestion(id: number) {
    this.assessSvc.deleteQuestion(this.selectedQuiz()!.id, id).subscribe(() => {
      this.toast.success('Question deleted');
      this.assessSvc.getQuestions(this.selectedQuiz()!.id).subscribe(q => this.questions.set(q));
    });
  }
}
