import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Payment History</h1>
    <p class="page-subtitle">All your transactions</p>

    @if (payments().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">💳</div>
        <h3 class="empty-state__title">No payments yet</h3>
        <p class="empty-state__desc">Your payment history will appear here</p>
      </div>
    } @else {
      <div class="card" style="padding:0">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (p of payments(); track p.paymentId) {
                <tr>
                  <td><code style="font-size:12px;color:var(--primary)">{{ p.transactionId | slice:0:12 }}...</code></td>
                  <td>Course #{{ p.courseId }}</td>
                  <td style="font-weight:700">{{ p.currency || '₹' }} {{ p.amount }}</td>
                  <td>{{ p.mode }}</td>
                  <td>
                    <span class="badge" [class]="'badge--' + statusColor(p.status)">{{ p.status }}</span>
                  </td>
                  <td style="color:var(--text-muted)">{{ p.paidAt | date:'mediumDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `
})
export class PaymentHistoryComponent implements OnInit {
  paymentService = inject(PaymentService);
  payments = signal<Payment[]>([]);

  statusColor(s: string) {
    return s === 'SUCCESS' ? 'success' : s === 'FAILED' ? 'danger' : s === 'REFUNDED' ? 'warning' : 'muted';
  }

  ngOnInit() { this.paymentService.getMyPayments().subscribe(p => this.payments.set(p)); }
}
