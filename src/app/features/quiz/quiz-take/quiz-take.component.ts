import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Quiz, Question, Attempt } from '../../../core/models';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!started() && !submitted()) {
      <!-- Quiz Intro -->
      <div class="quiz-intro">
        <div class="quiz-intro__icon">📝</div>
        @if (quiz()) {
          <h1>{{ quiz()!.title }}</h1>
          <p style="color:var(--text-muted);margin:8px 0 24px">{{ quiz()!.description }}</p>
          <div class="quiz-meta">
            <div class="quiz-meta__item">
              <span>⏱</span>
              <div><strong>{{ quiz()!.timeLimitMinutes }} minutes</strong><small>Time limit</small></div>
            </div>
            <div class="quiz-meta__item">
              <span>📋</span>
              <div><strong>{{ questions().length }} questions</strong><small>Total</small></div>
            </div>
            <div class="quiz-meta__item">
              <span>🎯</span>
              <div><strong>{{ quiz()!.passingScore }}%</strong><small>To pass</small></div>
            </div>
            <div class="quiz-meta__item">
              <span>🔄</span>
              <div><strong>{{ quiz()!.maxAttempts }} attempts</strong><small>Maximum</small></div>
            </div>
          </div>
          <div class="quiz-rules">
            <h4>Before you begin:</h4>
            <ul>
              <li>The timer starts when you click Start Quiz</li>
              <li>Quiz auto-submits when time runs out</li>
              <li>You can review and change answers before submitting</li>
              <li>Results are shown immediately after submission</li>
            </ul>
          </div>
          <button class="btn btn--primary btn--lg" (click)="startQuiz()" [disabled]="loading()">
            {{ loading() ? 'Loading...' : 'Start Quiz →' }}
          </button>
        }
      </div>
    }

    @if (started() && !submitted()) {
      <!-- Quiz in Progress -->
      <div class="quiz-layout">
        <!-- Header -->
        <div class="quiz-header">
          <div>
            <h2 style="font-size:18px;font-weight:700">{{ quiz()!.title }}</h2>
            <span style="font-size:13px;color:var(--text-muted)">Question {{ currentIdx() + 1 }} of {{ questions().length }}</span>
          </div>
          <div class="quiz-timer" [class.quiz-timer--warning]="timeLeft() <= 60">
            ⏱ {{ formatTime(timeLeft()) }}
          </div>
        </div>

        <!-- Progress -->
        <div class="progress-bar" style="margin-bottom:24px">
          <div class="progress-bar__fill" [style.width.%]="((currentIdx() + 1) / questions().length) * 100"></div>
        </div>

        <!-- Question -->
        @if (currentQuestion()) {
          <div class="question-card card">
            <div class="question-card__num">Q{{ currentIdx() + 1 }}</div>
            <h3 class="question-card__text">{{ currentQuestion()!.text }}</h3>
            <div class="question-card__marks">{{ currentQuestion()!.marks }} mark{{ currentQuestion()!.marks > 1 ? 's' : '' }}</div>

            <div class="options-list">
              @for (opt of currentQuestion()!.options; track opt; let i = $index) {
                <label class="option-item" [class.selected]="answers()[currentQuestion()!.id] === opt">
                  <input type="radio" [name]="'q_' + currentQuestion()!.id"
                    [value]="opt" (change)="selectAnswer(opt)">
                  <span class="option-letter">{{ letters[i] }}</span>
                  <span class="option-text">{{ opt }}</span>
                </label>
              }
            </div>
          </div>
        }

        <!-- Navigation -->
        <div class="quiz-nav">
          <button class="btn btn--outline" (click)="prevQ()" [disabled]="currentIdx() === 0">← Previous</button>
          <div class="quiz-dots">
            @for (q of questions(); track q.id; let i = $index) {
              <div class="quiz-dot"
                [class.answered]="!!answers()[q.id]"
                [class.current]="i === currentIdx()"
                (click)="goTo(i)">
                {{ i + 1 }}
              </div>
            }
          </div>
          @if (currentIdx() < questions().length - 1) {
            <button class="btn btn--primary" (click)="nextQ()">Next →</button>
          } @else {
            <button class="btn btn--success" (click)="confirmSubmit()" [disabled]="submitting()">
              {{ submitting() ? 'Submitting...' : 'Submit Quiz ✓' }}
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .quiz-intro { max-width: 640px; margin: 0 auto; text-align: center; padding: 40px 0; }
    .quiz-intro__icon { font-size: 64px; margin-bottom: 16px; }
    .quiz-intro h1 { font-size: 28px; font-weight: 900; }
    .quiz-meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; text-align: left; }
    .quiz-meta__item { background: var(--bg); border-radius: 12px; padding: 14px; display: flex; gap: 12px; align-items: center; }
    .quiz-meta__item span { font-size: 24px; }
    .quiz-meta__item strong { display: block; font-size: 15px; font-weight: 700; }
    .quiz-meta__item small { font-size: 12px; color: var(--text-muted); }
    .quiz-rules { background: var(--bg); border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 24px; }
    .quiz-rules h4 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
    .quiz-rules ul { list-style: disc; padding-left: 20px; }
    .quiz-rules li { font-size: 14px; color: var(--text-muted); margin-bottom: 6px; }

    .quiz-layout { max-width: 720px; margin: 0 auto; }
    .quiz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
    .quiz-timer { font-size: 20px; font-weight: 800; color: var(--primary); background: var(--primary-light); padding: 8px 16px; border-radius: 8px; }
    .quiz-timer--warning { color: var(--danger); background: #fee2e2; animation: pulse 1s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }

    .question-card { }
    .question-card__num { display: inline-block; background: var(--primary-light); color: var(--primary); font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 99px; margin-bottom: 12px; }
    .question-card__text { font-size: 18px; font-weight: 700; margin-bottom: 8px; line-height: 1.4; }
    .question-card__marks { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }

    .options-list { display: flex; flex-direction: column; gap: 10px; }
    .option-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 2px solid var(--border); border-radius: 10px; cursor: pointer; transition: border-color .15s, background .15s; }
    .option-item:hover { border-color: var(--primary); background: var(--primary-light); }
    .option-item.selected { border-color: var(--primary); background: var(--primary-light); }
    .option-item input { display: none; }
    .option-letter { width: 28px; height: 28px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .option-item.selected .option-letter { background: var(--primary); color: #fff; }
    .option-text { font-size: 15px; font-weight: 500; }

    .quiz-nav { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; gap: 16px; }
    .quiz-dots { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; justify-content: center; }
    .quiz-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; cursor: pointer; color: var(--text-muted); }
    .quiz-dot.answered { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
    .quiz-dot.current  { background: var(--primary); border-color: var(--primary); color: #fff; }
    @media (max-width: 640px) { .quiz-meta { grid-template-columns: 1fr 1fr; } }
  `]
})
export class QuizTakeComponent implements OnInit, OnDestroy {
  route      = inject(ActivatedRoute);
  router     = inject(Router);
  assessSvc  = inject(AssessmentService);
  toast      = inject(ToastService);

  quiz       = signal<Quiz | null>(null);
  questions  = signal<Question[]>([]);
  attempt    = signal<Attempt | null>(null);
  answers    = signal<Record<number, string>>({});

  started    = signal(false);
  submitted  = signal(false);
  loading    = signal(false);
  submitting = signal(false);
  currentIdx = signal(0);
  timeLeft   = signal(0);

  letters = ['A','B','C','D','E'];
  private timer: any;
  private quizId = 0;

  get currentQuestion() {
    return () => this.questions()[this.currentIdx()] ?? null;
  }

  ngOnInit() {
  const id = this.route.snapshot.paramMap.get('quizId');

  console.log("Route quizId 👉", id);

  if (!id || isNaN(Number(id))) {
    console.error("Invalid quizId ❌", id);
    this.toast.error("Invalid Quiz ID");
    return;
  }

  this.quizId = Number(id);

  this.loading.set(true);
  this.assessSvc.getQuizById(this.quizId).subscribe(q => {
    this.quiz.set(q);
    this.assessSvc.getQuestions(this.quizId).subscribe(qs => {
      this.questions.set(qs);
      this.loading.set(false);
    });
  });
}

  ngOnDestroy() { clearInterval(this.timer); }

  startQuiz() {
    this.loading.set(true);
    this.assessSvc.startAttempt(this.quizId).subscribe({
      next: a => {
        this.attempt.set(a);
        this.timeLeft.set(this.quiz()!.timeLimitMinutes * 60);
        this.started.set(true);
        this.loading.set(false);
        this.startTimer();
      },
      error: e => { this.loading.set(false); this.toast.error(e.error?.message || 'Could not start quiz'); }
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) { clearInterval(this.timer); this.submitQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  selectAnswer(opt: string) {
    const qId = this.currentQuestion()!.id;
    this.answers.update(a => ({ ...a, [qId]: opt }));
  }

  nextQ() { if (this.currentIdx() < this.questions().length - 1) this.currentIdx.update(i => i + 1); }
  prevQ() { if (this.currentIdx() > 0) this.currentIdx.update(i => i - 1); }
  goTo(i: number) { this.currentIdx.set(i); }

  confirmSubmit() {
    const unanswered = this.questions().length - Object.keys(this.answers()).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    this.submitQuiz();
  }

  submitQuiz() {
    clearInterval(this.timer);
    this.submitting.set(true);
    this.assessSvc.submitAttempt(this.attempt()!.attemptId, { answers: this.answers() }).subscribe({
      next: a => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.router.navigate(['/quiz', this.quizId, 'result'], {
          state: { attempt: a, quiz: this.quiz() }
        });
      },
      error: e => { this.submitting.set(false); this.toast.error(e.error?.message || 'Submission failed'); }
    });
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
