import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Course, CourseRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private base = `${environment.apiGateway}/api/courses`;

  constructor(private http: HttpClient) {}

  getAllCourses(params?: {
  category?: string;
  level?: string;
  keyword?: string;
  language?: string;
  admin?: boolean;
}): Observable<Course[]> {

  // ADMIN → ALL courses
  if (params?.admin) {

    return this.http.get<Course[]>(
      `${this.base}/admin/all`
    );
  }

  // STUDENT → only published courses
  let p = new HttpParams();

  if (params?.category)
    p = p.set('category', params.category);

  if (params?.level)
    p = p.set('level', params.level);

  if (params?.keyword)
    p = p.set('keyword', params.keyword);

  if (params?.language)
    p = p.set('language', params.language);

  return this.http.get<Course[]>(
    this.base,
    { params: p }
  );
}

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.base}/${id}`);
  }

  getFeaturedCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/featured`);
  }

  searchCourses(keyword: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/search`, {
      params: new HttpParams().set('keyword', keyword)
    });
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/category/${category}`);
  }

  getCoursesByInstructor(instructorId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.base}/instructor/${instructorId}`);
  }

  createCourse(req: CourseRequest): Observable<Course> {
    return this.http.post<Course>(this.base, req);
  }

  updateCourse(id: number, req: CourseRequest): Observable<Course> {
    return this.http.put<Course>(`${this.base}/${id}`, req);
  }

  // publishCourse(id: number): Observable<void> {
  //   return this.http.put<void>(`${this.base}/${id}/publish`, {});
  // }

  publishCourse(id: number): Observable<any> {
  return this.http.put(`${this.base}/${id}/publish`, {}, {
    responseType: 'text' as 'json'
  });
}

  unpublishCourse(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/unpublish`, {});
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  approveCourse(id: number): Observable<any> {

  return this.http.put(
    `${this.base}/admin/${id}/approve`,
    {},
    {
      responseType: 'text' as 'json'
    }
  );
}

  rejectCourse(id: number): Observable<any> {

  return this.http.put(
    `${this.base}/admin/${id}/reject`,
    {},
    {
      responseType: 'text' as 'json'
    }
  );
}
}
