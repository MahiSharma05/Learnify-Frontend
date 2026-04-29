import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription } from '../../../core/models';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">Subscription Plans</h1>
    <p class="page-subtitle">Choose the plan that works best for you</p>

    <!-- Current Subscription -->
    @if (current()) {
      <div class="card" style="margin-bottom:28px;border-color:var(--primary);background:var(--primary-light)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h3 style="font-weight:800;color:var(--primary);margin-bottom:4px">Current Plan: {{ current()!.plan }}</h3>
            <p style="font-size:13px;color:var(--text-muted)">
              Valid until {{ current()!.endDate | date:'longDate' }} ·
              Auto-renew: {{ current()!.autoRenew ? 'On' : 'Off' }}
            </p>
          </div>
          <span class="badge badge--success">{{ current()!.status }}</span>
        </div>
        <button class="btn btn--danger btn--sm" style="margin-top:16px" (click)="cancel()" [disabled]="loading()">
          Cancel Subscription
        </button>
      </div>
    }

    <!-- Plans -->
    <div class="plans-grid">
      @for (plan of plans; track plan.id) {
        <div class="plan-card" [class.plan-card--featured]="plan.featured">
          @if (plan.featured) { <div class="plan-badge">Most Popular</div> }
          <div class="plan-card__icon">{{ plan.icon }}</div>
          <h3 class="plan-card__name">{{ plan.name }}</h3>
          <div class="plan-card__price">
            <span class="plan-card__amount">{{ plan.price === 0 ? 'Free' : ('₹' + plan.price) }}</span>
            @if (plan.price > 0) { <span class="plan-card__period">/{{ plan.period }}</span> }
          </div>
          <ul class="plan-card__features">
            @for (f of plan.features; track f) {
              <li><span>✓</span> {{ f }}</li>
            }
          </ul>
          <button class="btn btn--full"
            [class]="plan.featured ? 'btn--primary' : 'btn--outline'"
            (click)="subscribe(plan.id)"
            [disabled]="loading() || current()?.plan === plan.id">
            {{ current()?.plan === plan.id ? 'Current Plan' : 'Get Started' }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); gap: 20px; }
    .plan-card { background: var(--surface); border: 2px solid var(--border); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px; position: relative; }
    .plan-card--featured { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(79,70,229,.08); }
    .plan-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 99px; white-space: nowrap; }
    .plan-card__icon { font-size: 36px; }
    .plan-card__name  { font-size: 20px; font-weight: 800; }
    .plan-card__price { display: flex; align-items: baseline; gap: 4px; }
    .plan-card__amount { font-size: 36px; font-weight: 900; color: var(--primary); }
    .plan-card__period { font-size: 14px; color: var(--text-muted); }
    .plan-card__features { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .plan-card__features li { display: flex; gap: 10px; font-size: 14px; color: var(--text-muted); }
    .plan-card__features li span { color: var(--success); font-weight: 700; flex-shrink: 0; }
  `]
})
export class SubscriptionComponent implements OnInit {
  paymentService = inject(PaymentService);
  toast          = inject(ToastService);

  current = signal<Subscription | null>(null);
  loading = signal(false);

  plans = [
    {
      id: 'FREE', name: 'Free', price: 0, period: '', icon: '🆓', featured: false,
      features: ['Access to free courses', 'Basic course previews', 'Community forum access', '5 quiz attempts/month']
    },
    {
      id: 'MONTHLY', name: 'Monthly', price: 999, period: 'month', icon: '⭐', featured: true,
      features: ['Unlimited course access', 'Certificate downloads', 'Priority support', 'Downloadable resources', 'All quizzes unlimited']
    },
    {
      id: 'ANNUAL', name: 'Annual', price: 7999, period: 'year', icon: '🚀', featured: false,
      features: ['Everything in Monthly', '33% savings vs monthly', 'Early access to new courses', 'Dedicated learning path', 'Career counseling session']
    },
  ];

  ngOnInit() {
    this.paymentService.getMySubscription().subscribe({ next: s => this.current.set(s), error: () => {} });
  }

  subscribe(planId: string) {
    this.loading.set(true);
    this.paymentService.subscribe(planId).subscribe({
      next: s => { this.current.set(s); this.loading.set(false); this.toast.success(`Subscribed to ${planId} plan!`); },
      error: e => { this.loading.set(false); this.toast.error(e.error?.message || 'Subscription failed'); }
    });
  }

  cancel() {
    if (!confirm('Cancel your subscription?')) return;
    this.loading.set(true);
    this.paymentService.cancelSubscription().subscribe({
      next: () => { this.current.set(null); this.loading.set(false); this.toast.success('Subscription cancelled'); },
      error: () => { this.loading.set(false); this.toast.error('Failed to cancel'); }
    });
  }
}
