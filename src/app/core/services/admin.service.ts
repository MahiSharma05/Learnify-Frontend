import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiGateway}/api/auth`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/users/role/${role}`);
  }

  suspendUser(userId: number): Observable<any> {
    return this.http.put(`${this.base}/users/${userId}/suspend`, {});
  }

  activateUser(userId: number): Observable<any> {
    return this.http.put(`${this.base}/users/${userId}/activate`, {});
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/delete/${userId}`);
  }

  getPlatformStats(): Observable<any> {
    return this.http.get(`${environment.apiGateway}/api/admin/stats`);
  }
}
