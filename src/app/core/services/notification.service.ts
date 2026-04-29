import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiGateway}/api/notifications`;
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/my`);
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/my/unread`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`)
      .pipe(tap(r => this.unreadCount.set(r.count)));
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.base}/${id}/read`, {})
      .pipe(tap(() => this.unreadCount.update(c => Math.max(0, c - 1))));
  }

  markAllAsRead(): Observable<{ markedRead: number }> {
    return this.http.put<{ markedRead: number }>(`${this.base}/read-all`, {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }

  deleteNotification(id: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/${id}`);
  }

  // Admin
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/all`);
  }

  sendBulkNotification(req: any): Observable<any> {
    return this.http.post(`${this.base}/bulk`, req);
  }

  // Admin: get all users to send notifications
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiGateway}/api/auth/users`);
  }
}
