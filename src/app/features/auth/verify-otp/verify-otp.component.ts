import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {

  otp: string = '';

  email: string = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {

    const storedEmail =
      localStorage.getItem('verifyEmail');

    if (!storedEmail) {

      this.toast.error(
        'No email found. Please register again.'
      );

      this.router.navigate(['/auth/register']);

      return;
    }

    this.email = storedEmail;
  }

  verifyOtp() {

    if (!this.otp || this.otp.trim().length !== 6) {

      this.toast.error(
        'Enter valid 6-digit OTP'
      );

      return;
    }

    const data = {

      email: this.email.trim(),

      otp: this.otp.trim()
    };

    console.log('VERIFY OTP REQUEST:', data);

    this.auth.verifyOtp(data)
      .subscribe({

        next: () => {

          this.toast.success(
            'Email verified successfully'
          );

          localStorage.removeItem('verifyEmail');

          this.router.navigate(['/auth/login']);
        },

        error: (err) => {

          console.error('VERIFY OTP ERROR:', err);

          this.toast.error(
            err.error?.message || 'OTP verification failed'
          );
        }
      });
  }

  resendOtp() {

    this.auth.resendOtp(this.email)
      .subscribe({

        next: () => {

          this.toast.success(
            'OTP resent successfully'
          );
        },

        error: (err) => {

          console.error(err);

          this.toast.error(
            err.error?.message || 'Failed to resend OTP'
          );
        }
      });
  }
}