import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/auth/login']);
};

export const instructorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() && (auth.isInstructor() || auth.isAdmin())
    ? true
    : router.createUrlTree(['/dashboard']);
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() && auth.isAdmin()
    ? true
    : router.createUrlTree(['/dashboard']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return !auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/dashboard']);
};