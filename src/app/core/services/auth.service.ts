import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'learnify_token';
  private readonly USER_KEY  = 'learnify_user';

  private _user = signal<User | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isStudent = computed(() => this._user()?.role === 'STUDENT');
  readonly isInstructor = computed(() => this._user()?.role === 'INSTRUCTOR');
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  private base = environment.apiGateway;

  constructor(private http: HttpClient, private router: Router) {}

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/api/auth/register`, req);
  }

  verifyOtp(data: any) {

  return this.http.post(
    `${this.base}/api/auth/verify-otp`,
    data,
    {
      responseType: 'text'
    }
  );
}

resendOtp(email: string) {

  return this.http.post(
    `${this.base}/api/auth/resend-otp?email=${email}`,
    {},
    {
      responseType: 'text'
    }
  );
}
  login(req: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    `${this.base}/api/auth/login`,
    {
      email: req.email,
      password: req.password
    }
  ).pipe(
    tap(res => this.persist(res))
  );
}

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.base}/api/auth/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/api/auth/profile`, data)
      .pipe(tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._user.set(user);
      }));
  }

  changePassword(oldPwd: string, newPwd: string): Observable<any> {
    return this.http.put(`${this.base}/api/auth/password`, {
      oldPassword: oldPwd,
      newPassword: newPwd
    });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.base}/api/auth/delete`);
  }

  // Google login
  initiateGoogleLogin(): void {
    window.location.href = `${this.base}/oauth2/authorization/google`;
  }

handleOAuthCallback(token: string): void {
  // ✅ 1. Save token
  localStorage.setItem(this.TOKEN_KEY, token);
  this._token.set(token);

  // ✅ 2. Call profile API WITH TOKEN manually (IMPORTANT FIX)
  this.http.get<User>(`${this.base}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).subscribe({
    next: (user) => {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this._user.set(user);

      // ✅ redirect after success
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('OAuth profile error:', err);
      this.logout();
    }
  });
}


  private persist(res: AuthResponse): void {
  localStorage.setItem(this.TOKEN_KEY, res.token);
  this._token.set(res.token);

  if (res.email) {
    const user: User = {
      userId: res.userId,
      fullName: res.fullName || '',
      email: res.email,
      role: res.role,
      profilePicUrl: res.profilePicUrl
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }
}

  private loadToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}