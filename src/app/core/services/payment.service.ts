import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, PaymentRequest, Subscription } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private payBase = `${environment.apiGateway}/api/payments`;
  private subBase = `${environment.apiGateway}/api/subscriptions`;

  constructor(private http: HttpClient) {}

  processPayment(req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.payBase, req);
  }

  getMyPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.payBase}/my`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.payBase}/all`);
  }

  refundPayment(paymentId: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.payBase}/${paymentId}/refund`, {});
  }

  // Subscriptions
  subscribe(plan: string): Observable<Subscription> {
    return this.http.post<Subscription>(this.subBase, { plan });
  }

  getMySubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.subBase}/my`);
  }

  cancelSubscription(): Observable<void> {
    return this.http.put<void>(`${this.subBase}/cancel`, {});
  }

  renewSubscription(): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.subBase}/renew`, {});
  }

  isActive(): Observable<{ active: boolean }> {
    return this.http.get<{ active: boolean }>(`${this.subBase}/active`);
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.subBase}/all`);
  }
}
