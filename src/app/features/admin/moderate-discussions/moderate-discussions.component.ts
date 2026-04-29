import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscussionService } from '../../../core/services/discussion.service';
import { ToastService } from '../../../core/services/toast.service';
import { DiscussionThread } from '../../../core/models';

@Component({
  selector: 'app-moderate-discussions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h1 class="page-title">Moderate Discussions</h1>
    <p class="page-subtitle">{{ threads().length }} threads across all courses</p>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Thread</th><th>Author</th><th>Course</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (t of threads(); track t.threadId) {
              <tr>
                <td>
                  <div>
                    <div style="font-weight:600;font-size:14px">
                      @if (t.isPinned) { <span style="color:var(--warning)">📌 </span> }
                      {{ t.title }}
                    </div>
                    <div style="font-size:12px;color:var(--text-muted)">{{ t.body | slice:0:60 }}...</div>
                  </div>
                </td>
                <td>#{{ t.authorId }}</td>
                <td>#{{ t.courseId }}</td>
                <td>
                  @if (t.isClosed) {
                    <span class="badge badge--muted">Closed</span>
                  } @else {
                    <span class="badge badge--success">Open</span>
                  }
                </td>
                <td style="color:var(--text-muted)">{{ t.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display:flex;gap:6px">
                    <a [routerLink]="['/courses', t.courseId, 'forum', t.threadId]" class="btn btn--ghost btn--sm">View</a>
                    @if (!t.isClosed) {
                      <button class="btn btn--outline btn--sm" (click)="close(t.threadId)">Close</button>
                    }
                    <button class="btn btn--outline btn--sm" (click)="pin(t.threadId)">📌 Pin</button>
                    <button class="btn btn--danger btn--sm" (click)="del(t.threadId)">Delete</button>
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
export class ModerateDiscussionsComponent implements OnInit {
  discSvc = inject(DiscussionService);
  toast   = inject(ToastService);
  threads = signal<DiscussionThread[]>([]);

  ngOnInit() { this.discSvc.getAllThreads().subscribe(t => this.threads.set(t)); }

  close(id: number) { this.discSvc.closeThread(id).subscribe(() => { this.toast.info('Thread closed'); this.ngOnInit(); }); }
  pin(id: number)   { this.discSvc.pinThread(id).subscribe(() => { this.toast.success('Thread pinned'); this.ngOnInit(); }); }
  del(id: number)   {
    if (!confirm('Delete this thread?')) return;
    this.discSvc.deleteThread(id).subscribe(() => { this.toast.success('Thread deleted'); this.ngOnInit(); });
  }
}
