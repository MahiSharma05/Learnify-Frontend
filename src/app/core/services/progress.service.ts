import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Progress, Certificate } from '../models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private progressBase     = `${environment.apiGateway}/api/progress`;
  private certificateBase  = `${environment.apiGateway}/api/certificates`;

  constructor(private http: HttpClient) {}

  trackProgress(courseId: number, lessonId: number, watchedSeconds: number): Observable<Progress> {
    return this.http.post<Progress>(this.progressBase, { courseId, lessonId, watchedSeconds });
  }

  markLessonComplete(courseId: number, lessonId: number): Observable<Progress> {
    return this.http.put<Progress>(`${this.progressBase}/complete`, { courseId, lessonId });
  }

  getCourseProgress(courseId: number): Observable<{ percent: number }> {
    return this.http.get<{ percent: number }>(`${this.progressBase}/course/${courseId}`);
  }

  getLessonProgress(lessonId: number): Observable<Progress> {
    return this.http.get<Progress>(`${this.progressBase}/lesson/${lessonId}`);
  }

  getAllProgressByCourse(courseId: number): Observable<Progress[]> {
    return this.http.get<Progress[]>(`${this.progressBase}/course/${courseId}/all`);
  }

  // Certificates
  issueCertificate(courseId: number): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.certificateBase}/issue`, { courseId });
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
