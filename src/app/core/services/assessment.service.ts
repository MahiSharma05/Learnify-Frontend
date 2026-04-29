import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quiz, QuizRequest, Question, QuestionRequest, Attempt, AttemptRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private quizBase    = `${environment.apiGateway}/api/quizzes`;
  private attemptBase = `${environment.apiGateway}/api/attempts`;

  constructor(private http: HttpClient) {}

  // ── Quiz CRUD ─────────────────────────────────────────────────────────────
  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.quizBase}/course/${courseId}`);
  }

  getQuizById(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.quizBase}/${quizId}`);
  }

  createQuiz(req: QuizRequest): Observable<Quiz> {
    return this.http.post<Quiz>(this.quizBase, req);
  }

  updateQuiz(quizId: number, req: QuizRequest): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.quizBase}/${quizId}`, req);
  }

  publishQuiz(quizId: number): Observable<void> {
    return this.http.put<void>(`${this.quizBase}/${quizId}/publish`, {});
  }

  deleteQuiz(quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.quizBase}/${quizId}`);
  }

  // ── Questions ─────────────────────────────────────────────────────────────
  getQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.quizBase}/${quizId}/questions`);
  }

  addQuestion(quizId: number, req: QuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.quizBase}/${quizId}/questions`, req);
  }

  updateQuestion(quizId: number, questionId: number, req: QuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${this.quizBase}/${quizId}/questions/${questionId}`, req);
  }

  deleteQuestion(quizId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.quizBase}/${quizId}/questions/${questionId}`);
  }

  // ── Attempts ─────────────────────────────────────────────────────────────
  startAttempt(quizId: number): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.attemptBase}/start/${quizId}`, {});
  }

  submitAttempt(attemptId: number, req: AttemptRequest): Observable<Attempt> {
    return this.http.post<Attempt>(`${this.attemptBase}/${attemptId}/submit`, req);
  }

  getMyAttempts(quizId: number): Observable<Attempt[]> {
    return this.http.get<Attempt[]>(`${this.attemptBase}/quiz/${quizId}/my`);
  }

  getBestScore(quizId: number): Observable<{ score: number }> {
    return this.http.get<{ score: number }>(`${this.attemptBase}/quiz/${quizId}/best`);
  }

  // Instructor/Admin
  getAttemptsByQuiz(quizId: number): Observable<Attempt[]> {
    return this.http.get<Attempt[]>(`${this.attemptBase}/quiz/${quizId}`);
  }
}
