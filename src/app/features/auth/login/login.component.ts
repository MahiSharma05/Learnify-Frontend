import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4f46e5"/>
            <path d="M6 10l8-4 8 4v2l-8 4-8-4v-2z" fill="white"/>
            <path d="M6 14l8 4 8-4" stroke="white" stroke-width="1.5" fill="none"/>
          </svg>
          <span>Learnify</span>
        </div>
        <h1>Welcome back!</h1>
        <p>Sign in to continue your learning journey and access your courses.</p>
        <div class="auth-illustration">
          <div class="ill-card">
            <div class="ill-icon">📚</div>
            <div>
              <strong>Continue Learning</strong>
              <span>Pick up where you left off</span>
            </div>
          </div>
          <div class="ill-card">
            <div class="ill-icon">🏆</div>
            <div>
              <strong>Earn Certificates</strong>
              <span>Complete courses & get certified</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2>Sign in to your account</h2>
          <p class="auth-sub">Don't have an account? <a routerLink="/auth/register">Sign up free</a></p>

          <!-- Google OAuth -->
          <button class="btn-google" (click)="loginWithGoogle()">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div class="auth-divider"><span>or sign in with email</span></div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input class="form-control" type="email" formControlName="email"
                placeholder="you@example.com" autocomplete="email">
              @if (form.get('email')?.touched && form.get('email')?.hasError('required')) {
                <span class="form-error">Email is required</span>
              }
              @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <span class="form-error">Enter a valid email</span>
              }
            </div>

            <div class="form-group">
              <div class="label-row">
                <label class="form-label">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-wrap">
                <input class="form-control" [type]="showPwd() ? 'text' : 'password'"
                  formControlName="password" placeholder="Your password" autocomplete="current-password">
                <button type="button" class="pwd-toggle" (click)="togglePwd()">
                  {{ showPwd() ? '🙈' : '👁' }}
                </button>
              </div>
              @if (form.get('password')?.touched && form.get('password')?.hasError('required')) {
                <span class="form-error">Password is required</span>
              }
            </div>

            @if (error()) {
              <div class="auth-error">{{ error() }}</div>
            }

            <button class="btn btn--primary btn--full" type="submit" [disabled]="loading()">
              @if (loading()) { <span class="btn-spinner"></span> Signing in... }
              @else { Sign In }
            </button>
          </form>

          <p class="auth-role-hint">
            Logging in as Admin? Use admin credentials — same form.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    .auth-left {
      background: linear-gradient(160deg, #4f46e5 0%, #0ea5e9 100%);
      color: #fff; padding: 48px; display: flex; flex-direction: column; gap: 32px;
    }
    .auth-brand { display: flex; align-items: center; gap: 12px; font-size: 22px; font-weight: 800; }
    .auth-brand svg rect { fill: rgba(255,255,255,.25); }
    .auth-left h1 { font-size: 40px; font-weight: 900; line-height: 1.1; }
    .auth-left p  { font-size: 16px; opacity: .85; line-height: 1.7; }
    .auth-illustration { display: flex; flex-direction: column; gap: 14px; margin-top: auto; }
    .ill-card { background: rgba(255,255,255,.15); backdrop-filter: blur(10px); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; }
    .ill-icon { font-size: 28px; }
    .ill-card strong { display: block; font-size: 15px; font-weight: 700; }
    .ill-card span   { font-size: 13px; opacity: .8; }

    .auth-right { display: flex; align-items: center; justify-content: center; padding: 48px; background: #f8fafc; }
    .auth-card { width: 100%; max-width: 420px; }
    .auth-card h2 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
    .auth-sub { font-size: 14px; color: #64748b; margin-bottom: 28px; }
    .auth-sub a { color: #4f46e5; font-weight: 600; }

    .btn-google {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 14px; font-weight: 600; background: #fff; cursor: pointer;
      transition: border-color .2s, box-shadow .2s;
    }
    .btn-google:hover { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
    .auth-divider { text-align: center; position: relative; margin: 20px 0; }
    .auth-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e2e8f0; }
    .auth-divider span { position: relative; background: #f8fafc; padding: 0 12px; font-size: 13px; color: #64748b; }
    .label-row { display: flex; justify-content: space-between; align-items: center; }
    .forgot-link { font-size: 13px; color: #4f46e5; }
    .input-wrap { position: relative; }
    .input-wrap .form-control { padding-right: 44px; }
    .pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; }
    .auth-error { background: #fee2e2; color: #991b1b; padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }
    .auth-role-hint { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 16px; }
    .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 768px) { .auth-page { grid-template-columns: 1fr; } .auth-left { display: none; } }
  `]
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private toast  = inject(ToastService);
  private router = inject(Router);

  showPwd = signal(false);
  loading = signal(false);
  error   = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading.set(true);
  this.error.set('');

  // ✅ Extract values properly
  const email = this.form.get('email')?.value || '';
  const password = this.form.get('password')?.value || '';

  // ❗ Ensure correct format
  this.auth.login({ email, password }).subscribe({
    next: (res) => {
      this.loading.set(false);
      this.toast.success(`Welcome back, ${res.fullName}!`);

      if (res.role === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (res.role === 'INSTRUCTOR') {
        this.router.navigate(['/instructor/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    },
    error: (err) => {
      this.loading.set(false);
      this.error.set(err.error?.message || 'Invalid email or password');
    }
  });
}



  togglePwd() { this.showPwd.set(!this.showPwd()); }
  loginWithGoogle() { this.auth.initiateGoogleLogin(); }
}
