import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar">
      <div class="navbar__brand" routerLink="/dashboard">
        <div class="navbar__logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--primary)"/>
            <path d="M6 10l8-4 8 4v2l-8 4-8-4v-2z" fill="white"/>
            <path d="M6 14l8 4 8-4" stroke="white" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <span class="navbar__name">Learnify</span>
      </div>

      <div class="navbar__search">
        <input type="text" placeholder="Search courses..." class="search-input"
          [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" />
        <button class="search-btn" (click)="onSearch()">🔍</button>
      </div>

      <div class="navbar__actions">
        <a routerLink="/courses" class="nav-link">Explore</a>

        @if (auth.isLoggedIn()) {
          <!-- Notifications Bell -->
          <div class="notif-wrapper">
            <button class="notif-btn" (click)="toggleNotif()" routerLink="/notifications">
              🔔
              @if (notifService.unreadCount() > 0) {
                <span class="notif-badge">{{ notifService.unreadCount() }}</span>
              }
            </button>
          </div>

          <!-- User Avatar -->
          <div class="user-menu" (click)="toggleMenu()">
            <div class="avatar">
              @if (auth.user()?.profilePicUrl) {
                <img [src]="auth.user()!.profilePicUrl" alt="avatar">
              } @else {
                <span>{{ auth.user()?.fullName?.[0]?.toUpperCase() }}</span>
              }
            </div>
            <span class="user-name">{{ auth.user()?.fullName?.split(' ')![0] }}</span>
            <span class="chevron">▾</span>

            @if (menuOpen()) {
              <div class="dropdown" (click)="$event.stopPropagation()">
                <div class="dropdown__header">
                  <strong>{{ auth.user()?.fullName }}</strong>
                  <span class="role-tag role-tag--{{ auth.user()?.role?.toLowerCase() }}">{{ auth.user()?.role }}</span>
                </div>
                <div class="dropdown__divider"></div>
                <a routerLink="/profile"     class="dropdown__item" (click)="closeMenu()">👤 My Profile</a>
                <a routerLink="/my-courses"  class="dropdown__item" (click)="closeMenu()">📚 My Courses</a>
                <a routerLink="/certificates"class="dropdown__item" (click)="closeMenu()">🏆 Certificates</a>
                @if (auth.isInstructor()) {
                  <a routerLink="/instructor/dashboard" class="dropdown__item" (click)="closeMenu()">🎓 Instructor Panel</a>
                }
                @if (auth.isAdmin()) {
                  <a routerLink="/admin/dashboard" class="dropdown__item" (click)="closeMenu()">⚙️ Admin Panel</a>
                }
                <div class="dropdown__divider"></div>
                <button class="dropdown__item dropdown__item--danger" (click)="logout()">↩ Logout</button>
              </div>
            }
          </div>
        } @else {
          <a routerLink="/auth/login"    class="btn btn--outline btn--sm">Login</a>
          <a routerLink="/auth/register" class="btn btn--primary btn--sm">Sign Up</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; gap: 20px;
      padding: 0 24px; height: 64px;
      background: var(--surface); border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 100;
      backdrop-filter: blur(12px);
    }
    .navbar__brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
    .navbar__name { font-size: 20px; font-weight: 800; color: var(--text); letter-spacing: -.5px; }
    .navbar__search { display: flex; align-items: center; flex: 1; max-width: 380px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; overflow: hidden; }
    .search-input { flex: 1; padding: 8px 14px; border: none; background: transparent; font-size: 14px; color: var(--text); outline: none; }
    .search-btn { padding: 8px 14px; background: none; border: none; cursor: pointer; font-size: 16px; }
    .navbar__actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
    .nav-link { font-size: 14px; color: var(--text-muted); text-decoration: none; font-weight: 500; }
    .nav-link:hover { color: var(--primary); }
    .notif-wrapper { position: relative; }
    .notif-btn { background: none; border: none; cursor: pointer; font-size: 20px; position: relative; padding: 6px; border-radius: 8px; }
    .notif-btn:hover { background: var(--bg); }
    .notif-badge { position: absolute; top: -2px; right: -2px; background: var(--danger); color: #fff; font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .user-menu { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border-radius: 8px; position: relative; user-select: none; }
    .user-menu:hover { background: var(--bg); }
    .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 14px; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .user-name { font-size: 14px; font-weight: 600; color: var(--text); }
    .chevron { font-size: 10px; color: var(--text-muted); }
    .dropdown { position: absolute; top: calc(100% + 8px); right: 0; width: 220px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.12); z-index: 200; overflow: hidden; }
    .dropdown__header { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
    .dropdown__divider { height: 1px; background: var(--border); }
    .dropdown__item { display: block; padding: 10px 16px; font-size: 14px; color: var(--text); text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; text-align: left; transition: background .15s; }
    .dropdown__item:hover { background: var(--bg); }
    .dropdown__item--danger { color: var(--danger); }
    .role-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; width: fit-content; }
    .role-tag--student    { background: #dbeafe; color: #1d4ed8; }
    .role-tag--instructor { background: #dcfce7; color: #15803d; }
    .role-tag--admin      { background: #fce7f3; color: #9d174d; }
    @media (max-width: 768px) {
      .navbar__search { display: none; }
      .user-name, .chevron { display: none; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  auth          = inject(AuthService);
  notifService  = inject(NotificationService);
  searchQuery   = '';
  menuOpen      = signal(false);

  ngOnInit() {
  if (this.auth.isLoggedIn()) {
    this.notifService.getUnreadCount().subscribe({
      next: (res) => {
        this.notifService.unreadCount.set(res.count || 0);
      },
      error: (err) => {
        console.error("Notification count error:", err);
        this.notifService.unreadCount.set(0);
      }
    });
  }
}

  toggleMenu()  { this.menuOpen.update(v => !v); }
  closeMenu()   { this.menuOpen.set(false); }
  toggleNotif() { this.menuOpen.set(false); }
  logout()      { this.auth.logout(); this.menuOpen.set(false); }

  onSearch() {
    if (this.searchQuery.trim()) {
      window.location.href = `/courses?keyword=${encodeURIComponent(this.searchQuery)}`;
    }
  }
}
