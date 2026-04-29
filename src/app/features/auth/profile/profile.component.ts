import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1 class="page-title">My Profile</h1>
      <p class="page-subtitle">Manage your account information</p>
    </div>

    <div class="profile-layout">
      <!-- Avatar Card -->
      <div class="card profile-avatar-card">
        <div class="avatar-lg" style="width:90px;height:90px;font-size:32px;margin:0 auto 16px">
          @if (auth.user()?.profilePicUrl) {
            <img [src]="auth.user()!.profilePicUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
          } @else {
            {{ auth.user()?.fullName?.[0]?.toUpperCase() }}
          }
        </div>
        <h3 style="text-align:center;font-size:18px;font-weight:700">{{ auth.user()?.fullName }}</h3>
        <p style="text-align:center;color:var(--text-muted);font-size:14px">{{ auth.user()?.email }}</p>
        <div style="display:flex;justify-content:center;margin-top:12px">
          <span class="badge badge--primary">{{ auth.user()?.role }}</span>
        </div>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;gap:20px">
        <!-- Profile Form -->
        <div class="card">
          <h2 class="section-title" style="margin-bottom:20px">Personal Information</h2>
          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
            <div class="grid grid--2">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input class="form-control" formControlName="fullName" placeholder="Your name">
              </div>
              <div class="form-group">
                <label class="form-label">Mobile</label>
                <input class="form-control" formControlName="mobile" placeholder="+91 98765 43210">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Bio</label>
              <textarea class="form-control" formControlName="bio" rows="3" placeholder="Tell us about yourself..."></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Profile Picture URL</label>
              <input class="form-control" formControlName="profilePicUrl" placeholder="https://...">
            </div>
            <button class="btn btn--primary" type="submit" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="card">
          <h2 class="section-title" style="margin-bottom:20px">Change Password</h2>
          <form [formGroup]="pwdForm" (ngSubmit)="changePassword()">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <input class="form-control" type="password" formControlName="oldPassword">
            </div>
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input class="form-control" type="password" formControlName="newPassword">
              @if (pwdForm.get('newPassword')?.touched && pwdForm.get('newPassword')?.hasError('minlength')) {
                <span class="form-error">Minimum 6 characters</span>
              }
            </div>
            <button class="btn btn--outline" type="submit" [disabled]="savingPwd()">
              {{ savingPwd() ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: flex; gap: 24px; align-items: flex-start; }
    .profile-avatar-card { width: 220px; flex-shrink: 0; text-align: center; }
    @media (max-width: 768px) { .profile-layout { flex-direction: column; } .profile-avatar-card { width: 100%; } }
  `]
})
export class ProfileComponent implements OnInit {
  auth  = inject(AuthService);
  toast = inject(ToastService);
  fb    = inject(FormBuilder);

  saving    = signal(false);
  savingPwd = signal(false);

  profileForm = this.fb.group({
    fullName:      [''],
    mobile:        [''],
    bio:           [''],
    profilePicUrl: [''],
  });

  pwdForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    const u = this.auth.user();
    if (u) {
      this.profileForm.patchValue({
        fullName: u.fullName, mobile: u.mobile || '',
        bio: u.bio || '', profilePicUrl: u.profilePicUrl || '',
      });
    }
  }

saveProfile() {
  this.saving.set(true);

  this.auth.updateProfile(this.profileForm.value as any).subscribe({
    next: () => {
      this.saving.set(false);
      this.toast.success('Profile updated!');
    },
    error: () => {
      this.saving.set(false);
      this.toast.error('Failed to update profile');
    }
  });
}

changePassword() {
  if (this.pwdForm.invalid) {
    this.pwdForm.markAllAsTouched();
    return;
  }

  this.savingPwd.set(true);

  const { oldPassword, newPassword } = this.pwdForm.value;

  this.auth.changePassword(oldPassword!, newPassword!).subscribe({
    next: () => {
      this.savingPwd.set(false);
      this.toast.success('Password updated!');
      this.pwdForm.reset();
    },
    error: () => {
      this.savingPwd.set(false);
      this.toast.error('Password change failed');
    }
  });
}

}
