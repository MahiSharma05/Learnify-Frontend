import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationRequest } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private base = `${environment.apiGateway}/api/notifications`;
  unreadCount = signal<number>(0);

  private http = inject(HttpClient);
  private auth = inject(AuthService); // ✅ ADD THIS

  // ✅ Helper to attach headers
  private getHeaders() {
    const user = this.auth.user();
    return {
      'X-User-Id': user?.userId?.toString() || '',
      'X-User-Role': user?.role || ''
    };
  }

  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/my`, {
      headers: this.getHeaders()
    });
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/my/unread`, {
      headers: this.getHeaders()
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/unread-count`, {
      headers: this.getHeaders()
    }).pipe(
      tap(r => this.unreadCount.set(r.count))
    );
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.base}/${id}/read`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
    );
  }

  markAllAsRead(): Observable<{ markedRead: number }> {
    return this.http.put<{ markedRead: number }>(`${this.base}/read-all`, {}, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }

  deleteNotification(id: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Admin
  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.base}/all`, {
      headers: this.getHeaders()
    });
  }

  sendBulkNotification(req: any): Observable<any> {
    return this.http.post(`${this.base}/bulk`, req, {
      headers: this.getHeaders()
    });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiGateway}/api/auth/users`);
  }
}