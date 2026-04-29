import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title">Manage Users</h1>

    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <input class="form-control" style="max-width:280px" [(ngModel)]="search"
        placeholder="Search by name or email..." (input)="filterUsers()">
      <select class="form-control" style="width:160px" [(ngModel)]="roleFilter" (change)="filterUsers()">
        <option value="">All Roles</option>
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <span class="badge badge--muted" style="align-self:center;font-size:14px;padding:8px 14px">
        {{ filtered().length }} users
      </span>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Provider</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered(); track u.userId) {
              <tr>
                <td style="color:var(--text-muted);font-size:12px">{{ u.userId }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar-sm">{{ u.fullName[0]?.toUpperCase() }}</div>
                    <div>
                      <div style="font-weight:600;font-size:14px">{{ u.fullName }}</div>
                      @if (u.bio) { <div style="font-size:12px;color:var(--text-muted)">{{ u.bio | slice:0:40 }}</div> }
                    </div>
                  </div>
                </td>
                <td style="color:var(--text-muted)">{{ u.email }}</td>
                <td>
                  <span class="badge"
                    [class]="u.role==='ADMIN'?'badge--danger':u.role==='INSTRUCTOR'?'badge--success':'badge--primary'">
                    {{ u.role }}
                  </span>
                </td>
                <td style="font-size:13px;color:var(--text-muted)">{{ u.provider || 'local' }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn--outline btn--sm" (click)="activate(u.userId)">✓ Activate</button>
                    <button class="btn btn--warning btn--sm" (click)="suspend(u)" style="background:#fef3c7;color:#92400e;border-color:#fbbf24">Suspend</button>
                    <button class="btn btn--danger btn--sm" (click)="deleteUser(u)">Delete</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManageUsersComponent implements OnInit {
  adminService = inject(AdminService);
  toast        = inject(ToastService);

  allUsers  = signal<User[]>([]);
  filtered  = signal<User[]>([]);
  search    = '';
  roleFilter= '';

  ngOnInit() {
    this.adminService.getAllUsers().subscribe(u => { this.allUsers.set(u); this.filtered.set(u); });
  }

  filterUsers() {
    const s = this.search.toLowerCase();
    this.filtered.set(this.allUsers().filter(u => {
      const matchSearch = !s || u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
      const matchRole   = !this.roleFilter || u.role === this.roleFilter;
      return matchSearch && matchRole;
    }));
  }

  suspend(u: User) {
    if (!confirm(`Suspend ${u.fullName}?`)) return;
    this.adminService.suspendUser(u.userId).subscribe({
      next: () => this.toast.success('User suspended'),
      error: () => this.toast.error('Failed to suspend user')
    });
  }

  activate(id: number) {
    this.adminService.activateUser(id).subscribe({
      next: () => this.toast.success('User activated'),
      error: () => this.toast.error('Failed to activate user')
    });
  }

  deleteUser(u: User) {
    if (!confirm(`Delete ${u.fullName} permanently?`)) return;
    this.adminService.deleteUser(u.userId).subscribe({
      next: () => { this.toast.success('User deleted'); this.allUsers.update(list => list.filter(x => x.userId !== u.userId)); this.filterUsers(); },
      error: () => this.toast.error('Failed to delete user')
    });
  }
}
