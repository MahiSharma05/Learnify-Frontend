import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Enrollment } from '../models';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private base = `${environment.apiGateway}/api/enrollments`;

  constructor(private http: HttpClient) {}

  enroll(
  courseId: number,
  courseTitle?: string,
  courseThumbnail?: string
): Observable<Enrollment> {

  return this.http.post<Enrollment>(
    this.base,
    {
      courseId,
      courseTitle,
      courseThumbnail
    }
  );
}

  unenroll(enrollmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${enrollmentId}`);
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.base}/my`);
  }

  getEnrollmentsByCourse(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.base}/course/${courseId}`);
  }

  isEnrolled(courseId: number): Observable<{ enrolled: boolean }> {
    return this.http.get<{ enrolled: boolean }>(`${this.base}/check/${courseId}`);
  }

  updateProgress(enrollmentId: number, progressPercent: number): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.base}/${enrollmentId}/progress`, { progressPercent });
  }

  markComplete(enrollmentId: number): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.base}/${enrollmentId}/complete`, {});
  }

  issueCertificate(enrollmentId: number): Observable<any> {
    return this.http.post(`${this.base}/${enrollmentId}/certificate`, {});
  }

  getEnrollmentCount(courseId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/course/${courseId}/count`);
  }

  // Admin
  getAllEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.base}/all`);
  }
}
