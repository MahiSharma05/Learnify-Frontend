import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Payment } from '../../../core/models';

@Component({
  selector: 'app-manage-payments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">All Payments</h1>
    <div class="grid grid--3" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-card__icon">💰</div>
        <div class="stat-card__value">₹{{ totalRevenue() }}</div>
        <div class="stat-card__label">Total Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">✅</div>
        <div class="stat-card__value">{{ successful() }}</div>
        <div class="stat-card__label">Successful Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">↩</div>
        <div class="stat-card__value">{{ refunded() }}</div>
        <div class="stat-card__label">Refunded</div>
      </div>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Txn ID</th><th>Student</th><th>Course</th><th>Amount</th><th>Mode</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (p of payments(); track p.paymentId) {
              <tr>
                <td><code style="font-size:11px">{{ p.transactionId | slice:0:14 }}</code></td>
                <td>#{{ p.studentId }}</td>
                <td>#{{ p.courseId }}</td>
                <td style="font-weight:700">{{ p.currency || '₹' }}{{ p.amount }}</td>
                <td>{{ p.mode }}</td>
                <td>
                  <span class="badge"
                    [class]="p.status==='SUCCESS'?'badge--success':p.status==='REFUNDED'?'badge--warning':p.status==='FAILED'?'badge--danger':'badge--muted'">
                    {{ p.status }}
                  </span>
                </td>
                <td style="color:var(--text-muted)">{{ p.paidAt | date:'mediumDate' }}</td>
                <td>
                  @if (p.status === 'SUCCESS') {
                    <button class="btn btn--outline btn--sm" (click)="p.paymentId && refund(p.paymentId)">Refund</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManagePaymentsComponent implements OnInit {
  paymentService = inject(PaymentService);
  toast          = inject(ToastService);
  payments       = signal<Payment[]>([]);

  totalRevenue = () => this.payments().filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
  successful   = () => this.payments().filter(p => p.status === 'SUCCESS').length;
  refunded     = () => this.payments().filter(p => p.status === 'REFUNDED').length;

  ngOnInit() { this.paymentService.getAllPayments().subscribe(p => this.payments.set(p)); }

  refund(id?: number) {
  if (!id) return;

  if (!confirm('Process refund for this payment?')) return;

  this.paymentService.refundPayment(id).subscribe({
    next: () => {
      this.toast.success('Refund processed');
      this.ngOnInit();
    },
    error: () => this.toast.error('Refund failed')
  });
}
}
