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
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  // ✅ Inject dependencies
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  // ✅ Create form (NO ngOnInit needed)
  registerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['STUDENT', Validators.required] // default role
  });

  // ✅ Submit handler
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form = this.registerForm.value;

    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Account created successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Registration failed');
      }
    });
  }
}

