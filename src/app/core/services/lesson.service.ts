import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Lesson, LessonRequest, Resource } from '../models';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private base = `${environment.apiGateway}/api/lessons`;

  constructor(private http: HttpClient) {}

  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.base}/course/${courseId}`);
  }

  getLessonById(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.base}/${id}`);
  }

  getPreviewLessons(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.base}/course/${courseId}/preview`);
  }

  addLesson(req: LessonRequest): Observable<Lesson> {
    return this.http.post<Lesson>(this.base, req);
  }

  updateLesson(id: number, req: LessonRequest): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.base}/${id}`, req);
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  reorderLessons(courseId: number, ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.base}/course/${courseId}/reorder`, { lessonIds: ids });
  }

  addResource(lessonId: number, resource: Partial<Resource>): Observable<Resource> {
    return this.http.post<Resource>(`${this.base}/${lessonId}/resources`, resource);
  }

  removeResource(lessonId: number, resourceId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${lessonId}/resources/${resourceId}`);
  }
}
