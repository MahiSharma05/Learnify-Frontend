import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressService } from '../../../core/services/progress.service';
import { Certificate } from '../../../core/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <h1 class="page-title">My Certificates</h1>
    <p class="page-subtitle">Your earned course completion certificates</p>

    @if (certs().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">🏆</div>
        <h3 class="empty-state__title">No certificates yet</h3>
        <p class="empty-state__desc">Complete a course to earn your first certificate!</p>
        <a routerLink="/my-courses" class="btn btn--primary">View My Courses</a>
      </div>
    } @else {
      <div class="grid grid--auto">
        @for (cert of certs(); track cert.certificateId) {
          <div class="cert-card">
            <div class="cert-card__header">
              <div class="cert-trophy">🏆</div>
              <div class="cert-card__ribbon">Certificate of Completion</div>
            </div>
            <div class="cert-card__body">
              <h3 class="cert-card__course">{{ cert.courseName }}</h3>
              <p class="cert-card__instructor">Instructor: {{ cert.instructorName }}</p>
              <p class="cert-card__date">Issued: {{ cert.issuedAt | date:'longDate' }}</p>
              <!-- <div class="cert-card__code">
                 <span>Verification Code:</span>
                 <code>{{ cert.verificationCode }}</code>
               </div> -->
              <div class="cert-card__code">
                <span>Paste Verification Code:</span>
                <input
                  type="text"
                  [(ngModel)]="cert.enteredCode"
                  placeholder="Paste code here"
                   style="padding:8px; border-radius:6px; border:1px solid #ccc; width:100%; margin-top:5px;"/>
              </div>
            </div>
            <div class="cert-card__actions">
              <a [routerLink]="['/certificate', cert.id]" class="btn btn--primary btn--sm">
              🎓 View Certificate
               </a>
              <!-- <a [routerLink]="['/verify', cert.verificationCode]" class="btn btn--outline btn--sm">
                 🔗 Verify
              </a> -->
              <button 
             class="btn btn--outline btn--sm"
             [disabled]="!cert.enteredCode"
             (click)="verify(cert.enteredCode || '')">
             🔍 Verify
             </button>
              <button class="btn btn--ghost btn--sm" (click)="copyCode(cert.verificationCode)">
                📋 Copy Code
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .cert-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden;
      box-shadow: var(--shadow);
    }
    .cert-card__header {
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      padding: 28px; text-align: center; position: relative;
    }
    .cert-trophy { font-size: 48px; display: block; }
    .cert-card__ribbon {
      color: rgba(255,255,255,.85); font-size: 12px;
      font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px;
    }
    .cert-card__body { padding: 20px; }
    .cert-card__course { font-size: 17px; font-weight: 800; margin-bottom: 6px; color: var(--text); }
    .cert-card__instructor { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
    .cert-card__date { font-size: 13px; color: var(--text-muted); margin-bottom: 14px; }
    .cert-card__code {
      background: var(--bg); border-radius: 8px; padding: 10px 14px;
      font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;
    }
    .cert-card__code code { font-family: 'JetBrains Mono', monospace; color: var(--primary); font-size: 12px; word-break: break-all; }
    .cert-card__actions { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap; }
  `]
})
export class CertificatesComponent implements OnInit {
  progressService = inject(ProgressService);
  certs = signal<Certificate[]>([]);

  ngOnInit() { this.progressService.getMyCertificates().subscribe(c => this.certs.set(c)); }

  copyCode(code: string | null | undefined) {

  console.log("Code being copied 👉", code);

  // 🔒 Prevent copying null/empty
  if (!code) {
    alert("No code available to copy ❌");
    return;
  }

  // ✅ Modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code)
      .then(() => {
        console.log("Copied successfully ✅");
        alert("Code copied!");
      })
      .catch(err => {
        console.error("Clipboard failed ❌", err);
        this.fallbackCopy(code);   // fallback
      });
  } else {
    this.fallbackCopy(code);       // fallback
  }
}

// 🔥 Fallback for older browsers
fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;

  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    console.log("Fallback copied 👉", text);
    alert("Code copied!");
  } catch (err) {
    console.error("Fallback failed ❌", err);
    alert("Copy failed ❌");
  }

  document.body.removeChild(textarea);
}
verify(code: string) {

  console.log("Verifying 👉", code);

  if (!code) {
    alert("Please paste verification code ❌");
    return;
  }

  this.progressService.verifyCertificate(code).subscribe({
    next: (res) => {
      alert("Certificate Verified ✅");
      console.log("Verified 👉", res);
    },
    error: () => {
      alert("Invalid Certificate ❌");
    }
  });

}
}
