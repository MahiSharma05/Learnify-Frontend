import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Progress, Certificate } from '../models';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private progressBase    = `${environment.apiGateway}/api/progress`;
  private certificateBase = `${environment.apiGateway}/api/certificates`;

  constructor(private http: HttpClient) {}

  // FIX: backend endpoint is POST /api/progress/track (not POST /api/progress)
  // trackProgress(courseId: number, lessonId: number, watchedSeconds: number): Observable<Progress> {
  //   return this.http.post<Progress>(`${this.progressBase}/track`, {
  //     courseId,
  //     lessonId,
  //     watchedSeconds,
  //     markComplete: false
  //   });
  // }

  trackProgress(courseId: number, lessonId: number, watchedSeconds: number,lessonTotalSeconds: number): Observable<Progress> {

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const headers = new HttpHeaders({
    'X-User-Id': String(user.id),
    'X-User-Email': user.email,
    'X-User-Role': user.role
  });

  return this.http.post<Progress>(
    `${this.progressBase}/track`,
    {
      courseId,
      lessonId,
      watchedSeconds,
      lessonTotalSeconds,
      markComplete: false
    },
    { headers }
  );
}

  // FIX: backend endpoint is PUT /api/progress/complete
  // markLessonComplete(courseId: number, lessonId: number): Observable<Progress> {
  //   return this.http.put<Progress>(`${this.progressBase}/complete`, { courseId, lessonId });
  // }

  markLessonComplete(courseId: number, lessonId: number): Observable<Progress> {

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const headers = new HttpHeaders({
    'X-User-Id': String(user.id),
    'X-User-Email': user.email,
    'X-User-Role': user.role
  });

  return this.http.put<Progress>(
    `${this.progressBase}/complete`,
    { courseId, lessonId },
    { headers }
  );
}

  // FIX: backend returns { completionPercent } not { percent }
  // Map it to { percent } so existing components work unchanged
  getCourseProgress(courseId: number): Observable<{ percent: number }> {
    return this.http.get<any>(`${this.progressBase}/course/${courseId}`).pipe(
      map(r => ({ percent: r.completionPercent ?? r.percent ?? 0 }))
    );
  }

  getLessonProgress(lessonId: number): Observable<Progress> {
    return this.http.get<Progress>(`${this.progressBase}/lesson/${lessonId}`);
  }

  // FIX: backend has GET /api/progress/my (returns all lessons for student)
  // Old code called /course/{id}/all which does NOT exist
  getAllProgressByCourse(courseId: number): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.progressBase}/my`).pipe(
      map(list => list.filter((p: any) => p.courseId === courseId))
    );
  }

  // Certificates
  issueCertificate(courseId: number, courseTitle?: string, studentName?: string): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.certificateBase}/issue`, {
      courseId,
      courseTitle: courseTitle || 'Course',
      studentName: studentName || '',
      instructorName: 'Learnify Platform'
    });
  }

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.certificateBase}/my`);
  }

  getCertificate(courseId: number): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.certificateBase}/course/${courseId}`);
  }

  verifyCertificate(code: string): Observable<Certificate> {
    return this.http.get<Certificate>(`${this.certificateBase}/verify/${code}`);
  }

  getAllCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.certificateBase}/all`);
  }
}