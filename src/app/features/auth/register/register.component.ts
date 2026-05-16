import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // ✅ IMPORTANT (fix UI issue)
})
export class RegisterComponent {

  // ✅ Inject dependencies
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // ✅ Form
  registerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['STUDENT', Validators.required]
  });

  // ✅ Submit
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.value;

    this.auth.register(payload).subscribe({
      next: () => {

  this.toast.success('OTP sent to your email');

  localStorage.setItem(
    'verifyEmail',
    this.registerForm.value.email
  );

  this.router.navigate(['/auth/verify-otp']);
},
      error: (err) => {
        console.error('Register Error:', err);
        this.toast.error(err.error?.message || 'Registration failed');
      }
    });
  }
}