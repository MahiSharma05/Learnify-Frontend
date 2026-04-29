import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment.service';
import { Attempt, Quiz } from '../../../core/models';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="result-page">
      @if (attempt()) {
        <div class="result-card">
          <div class="result-icon" [class.passed]="attempt()!.passed" [class.failed]="!attempt()!.passed">
            {{ attempt()!.passed ? '🎉' : '😔' }}
          </div>

          <h1>{{ attempt()!.passed ? 'Congratulations!' : 'Better luck next time!' }}</h1>
          <p class="result-status" [class.passed-text]="attempt()!.passed" [class.failed-text]="!attempt()!.passed">
            {{ attempt()!.passed ? 'You passed the quiz!' : 'You did not meet the passing score' }}
          </p>

          <div class="score-display">
            <div class="score-circle" [class.passed-circle]="attempt()!.passed" [class.failed-circle]="!attempt()!.passed">
              <span class="score-num">{{ attempt()!.score }}</span>
              <span class="score-label">Score</span>
            </div>
          </div>

          <div class="result-stats">
            <div class="result-stat">
              <strong>{{ attempt()!.score }}%</strong>
              <span>Your Score</span>
            </div>
            <div class="result-stat">
              <strong>{{ quiz()?.passingScore }}%</strong>
              <span>Passing Score</span>
            </div>
            <div class="result-stat">
              <strong>{{ attempt()!.passed ? 'PASSED' : 'FAILED' }}</strong>
              <span>Result</span>
            </div>
          </div>

          <div class="result-times">
            <span>Started: {{ attempt()!.startedAt | date:'medium' }}</span>
            @if (attempt()!.submittedAt) {
              <span>Submitted: {{ attempt()!.submittedAt | date:'medium' }}</span>
            }
          </div>

          @if (pastAttempts().length > 0) {
            <div class="past-attempts">
              <h4>Attempt History</h4>
              @for (a of pastAttempts(); track a.attemptId) {
                <div class="attempt-row">
                  <span>Attempt #{{ a.attemptId }}</span>
                  <span class="badge" [class]="'badge--' + (a.passed ? 'success' : 'danger')">{{ a.score }}%</span>
                  <span style="color:var(--text-muted);font-size:12px">{{ a.startedAt | date:'shortDate' }}</span>
                </div>
              }
            </div>
          }

          <div class="result-actions">
            <button class="btn btn--outline" (click)="router.navigate(['/quiz', quizId, 'take'])">
              Retry Quiz
            </button>
            <button class="btn btn--ghost" onclick="history.back()">
              ← Back to Course
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .result-page { display: flex; justify-content: center; align-items: flex-start; padding: 40px 16px; }
    .result-card { max-width: 520px; width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 40px; text-align: center; display: flex; flex-direction: column; gap: 20px; }
    .result-icon { font-size: 64px; }
    .result-card h1 { font-size: 28px; font-weight: 900; }
    .result-status { font-size: 16px; font-weight: 600; }
    .passed-text { color: var(--success); }
    .failed-text { color: var(--danger); }

    .score-display { display: flex; justify-content: center; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; border: 6px solid; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .passed-circle { border-color: var(--success); }
    .failed-circle  { border-color: var(--danger); }
    .score-num  { font-size: 36px; font-weight: 900; }
    .score-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

    .result-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .result-stat { background: var(--bg); border-radius: 10px; padding: 14px; }
    .result-stat strong { display: block; font-size: 20px; font-weight: 800; color: var(--text); }
    .result-stat span   { font-size: 12px; color: var(--text-muted); }

    .result-times { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: var(--text-muted); }
    .past-attempts { background: var(--bg); border-radius: 12px; padding: 16px; text-align: left; }
    .past-attempts h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
    .attempt-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .attempt-row:last-child { border: none; }
    .attempt-row span:first-child { flex: 1; font-size: 14px; }

    .result-actions { display: flex; gap: 12px; justify-content: center; }
  `]
})
export class QuizResultComponent implements OnInit {
  router    = inject(Router);
  assessSvc = inject(AssessmentService);

  attempt      = signal<Attempt | null>(null);
  quiz         = signal<Quiz | null>(null);
  pastAttempts = signal<Attempt[]>([]);
  quizId       = 0;

  ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras?.state as any;
    if (state?.attempt) {
      this.attempt.set(state.attempt);
      this.quiz.set(state.quiz);
      this.quizId = state.attempt.quizId;
      this.assessSvc.getMyAttempts(this.quizId).subscribe(a => this.pastAttempts.set(a));
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
