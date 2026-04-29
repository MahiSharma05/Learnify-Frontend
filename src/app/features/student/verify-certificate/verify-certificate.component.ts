import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProgressService } from '../../../core/services/progress.service';
import { Certificate } from '../../../core/models';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-page">
      <div class="verify-nav">
        <a routerLink="/" class="verify-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4f46e5"/>
            <path d="M6 10l8-4 8 4v2l-8 4-8-4v-2z" fill="white"/>
          </svg>
          Learnify
        </a>
        <span style="font-size:14px;color:#64748b">Certificate Verification</span>
      </div>

      <div class="verify-container">
        @if (loading()) {
          <div style="text-align:center;padding:60px">
            <div class="spinner"></div>
            <p style="margin-top:16px;color:#64748b">Verifying certificate...</p>
          </div>
        } @else if (cert()) {
          <div class="verify-success">
            <div class="verify-badge">✓</div>
            <h1>Certificate Verified!</h1>
            <p class="verify-sub">This certificate is authentic and was issued by Learnify</p>

            <div class="cert-display">
              <div class="cert-display__header">
                <span>🏆</span>
                <h2>Certificate of Completion</h2>
                <p>Learnify Platform</p>
              </div>
              <div class="cert-display__body">
                <p style="color:#64748b;font-size:14px">This certifies that</p>
                <h3 style="font-size:24px;font-weight:800;color:#0f172a;margin:8px 0">{{ cert()!.instructorName }}</h3>
                <p style="color:#64748b;font-size:14px">has successfully completed</p>
                <h4 style="font-size:20px;font-weight:700;color:#4f46e5;margin:8px 0">{{ cert()!.courseName }}</h4>
                <p style="font-size:13px;color:#94a3b8;margin-top:16px">
                  Issued on {{ cert()!.issuedAt | date:'longDate' }}
                </p>
                <div style="background:#f8fafc;border-radius:8px;padding:12px;margin-top:16px;font-size:12px;color:#64748b">
                  Verification Code: <strong style="color:#4f46e5">{{ cert()!.verificationCode }}</strong>
                </div>
              </div>
            </div>
          </div>
        } @else if (notFound()) {
          <div class="verify-fail">
            <div class="verify-badge verify-badge--fail">✗</div>
            <h1>Certificate Not Found</h1>
            <p>The verification code <strong>{{ code }}</strong> does not match any certificate in our system.</p>
            <a routerLink="/" class="btn btn--primary" style="margin-top:24px">Go to Learnify</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page { min-height: 100vh; background: #f8fafc; }
    .verify-nav { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: #fff; border-bottom: 1px solid #e2e8f0; }
    .verify-brand { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: #0f172a; }
    .verify-container { max-width: 600px; margin: 60px auto; padding: 0 24px; }
    .verify-success, .verify-fail { text-align: center; }
    .verify-badge { width: 72px; height: 72px; border-radius: 50%; background: #10b981; color: #fff; font-size: 36px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .verify-badge--fail { background: #ef4444; }
    .verify-success h1, .verify-fail h1 { font-size: 30px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
    .verify-sub { font-size: 15px; color: #64748b; margin-bottom: 32px; }
    .cert-display { border: 2px solid #4f46e5; border-radius: 16px; overflow: hidden; text-align: center; }
    .cert-display__header { background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: #fff; padding: 28px; }
    .cert-display__header span { font-size: 48px; display: block; margin-bottom: 8px; }
    .cert-display__header h2 { font-size: 22px; font-weight: 800; }
    .cert-display__header p  { opacity: .8; font-size: 14px; }
    .cert-display__body { padding: 32px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VerifyCertificateComponent implements OnInit {
  route           = inject(ActivatedRoute);
  progressService = inject(ProgressService);

  loading  = signal(true);
  cert     = signal<Certificate | null>(null);
  notFound = signal(false);
  code     = '';

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code')!;
    this.progressService.verifyCertificate(this.code).subscribe({
      next: c  => { this.cert.set(c); this.loading.set(false); },
      error: () => { this.notFound.set(true); this.loading.set(false); }
    });
  }
}
