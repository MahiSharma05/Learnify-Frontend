import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar__nav">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" routerLinkActive="active"
             class="sidebar__item" [title]="collapsed ? item.label : ''">
            <span class="sidebar__icon">{{ item.icon }}</span>
            @if (!collapsed) { <span class="sidebar__label">{{ item.label }}</span> }
          </a>
        }
      </div>
      <button class="sidebar__toggle" (click)="collapsed = !collapsed">
        {{ collapsed ? '▶' : '◀' }}
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 220px; height: 100%; background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      padding: 16px 0;
      transition: width .25s ease;
      position: relative;
    }
    .sidebar.collapsed { width: 60px; }
    .sidebar__nav { display: flex; flex-direction: column; gap: 2px; padding: 0 8px; flex: 1; }
    .sidebar__item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 8px;
      text-decoration: none; color: var(--text-muted);
      font-size: 14px; font-weight: 500;
      transition: background .15s, color .15s;
      white-space: nowrap; overflow: hidden;
    }
    .sidebar__item:hover, .sidebar__item.active {
      background: var(--primary-light); color: var(--primary);
    }
    .sidebar__icon { font-size: 18px; flex-shrink: 0; }
    .sidebar__toggle {
      background: none; border: 1px solid var(--border); cursor: pointer;
      padding: 6px 12px; margin: 8px; border-radius: 8px;
      font-size: 12px; color: var(--text-muted); align-self: center;
    }
    @media (max-width: 768px) { .sidebar { display: none; } }
  `]
})
export class SidebarComponent {
  auth      = inject(AuthService);
  collapsed = false;

  get navItems(): NavItem[] {
    const role = this.auth.user()?.role;
    if (role === 'ADMIN') return [
      { label: 'Dashboard',     icon: '🏠', route: '/admin/dashboard' },
      { label: 'Users',         icon: '👥', route: '/admin/users' },
      { label: 'Courses',       icon: '📚', route: '/admin/courses' },
      { label: 'Enrollments',   icon: '📋', route: '/admin/enrollments' },
      { label: 'Payments',      icon: '💳', route: '/admin/payments' },
      { label: 'Certificates',  icon: '🏆', route: '/admin/certificates' },
      { label: 'Notifications', icon: '📣', route: '/admin/notifications' },
      { label: 'Discussions',   icon: '💬', route: '/admin/discussions' },
      { label: 'Analytics',     icon: '📊', route: '/admin/analytics' },
    ];
    if (role === 'INSTRUCTOR') return [
      { label: 'Dashboard',    icon: '🏠', route: '/instructor/dashboard' },
      { label: 'My Courses',   icon: '📚', route: '/instructor/courses' },
      { label: 'Analytics',    icon: '📊', route: '/instructor/analytics' },
      { label: 'Notifications',icon: '🔔', route: '/notifications' },
      { label: 'Profile',      icon: '👤', route: '/profile' },
    ];
    return [
      { label: 'Dashboard',    icon: '🏠', route: '/dashboard' },
      { label: 'Explore',      icon: '🔍', route: '/courses' },
      { label: 'My Courses',   icon: '📚', route: '/my-courses' },
      { label: 'Progress',     icon: '📈', route: '/my-progress' },
      { label: 'Certificates', icon: '🏆', route: '/certificates' },
      { label: 'Payments',     icon: '💳', route: '/payments' },
      { label: 'Subscription', icon: '⭐', route: '/subscription' },
      { label: 'Notifications',icon: '🔔', route: '/notifications' },
      { label: 'Profile',      icon: '👤', route: '/profile' },
    ];
  }
}
