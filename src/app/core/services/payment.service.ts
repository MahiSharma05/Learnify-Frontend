import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, Subscription } from '../models';
import { catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private payBase = `${environment.apiGateway}/api/payments`;
  private subBase = `${environment.apiGateway}/api/subscriptions`;

  constructor(private http: HttpClient) {}

  // ================= RAZORPAY =================

  // STEP 1: Create Razorpay Order
  // NO manual headers needed — auth.interceptor adds Bearer token automatically.
  // API Gateway reads the token and sets X-User-Id, X-User-Email, X-User-Role.
  createOrder(courseId: number, courseTitle: string, amount: number): Observable<any> {
    return this.http.post<any>(`${this.payBase}/create-order`, {
      courseId,
      courseTitle,
      amount
    });
  }

  // STEP 2: Verify Payment after Razorpay success callback
  verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    courseId: number;
    courseTitle: string;
    amount: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.payBase}/verify`, data);
  }

  // ================= EXISTING (keep) =================

  processPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.payBase}`, data);
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

  // ================= SUBSCRIPTIONS =================

  subscribe(plan: string): Observable<Subscription> {
    return this.http.post<Subscription>(this.subBase, {
      plan,
      paymentMode: 'CARD',
      autoRenew: false
    });
  }

  getMySubscription(): Observable<Subscription | null> {
    return this.http.get<Subscription>(`${this.subBase}/my`).pipe(
      catchError(() => of(null as any))
    );
  }

  cancelSubscription(subscriptionId: number): Observable<any> {
    return this.http.post<any>(`${this.subBase}/${subscriptionId}/cancel`, {});
  }

  renewSubscription(subscriptionId: number): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.subBase}/${subscriptionId}/renew`, {});
  }

  isActive(): Observable<{ active: boolean }> {
    return this.http.get<{ active: boolean }>(`${this.subBase}/active`);
  }

  getAllSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.subBase}/all`);
  }
}