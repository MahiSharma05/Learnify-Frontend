import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DiscussionService } from '../../../core/services/discussion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DiscussionThread } from '../../../core/models';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h1 class="page-title">Course Forum</h1>
        <p class="page-subtitle">Ask questions and discuss with peers</p>
      </div>
      <button class="btn btn--primary" (click)="showForm.set(!showForm())">
        {{ showForm() ? '✕ Cancel' : '+ New Thread' }}
      </button>
    </div>

    @if (showForm()) {
      <div class="card" style="margin-bottom:24px">
        <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">Create New Thread</h3>
        <form [formGroup]="form" (ngSubmit)="createThread()">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input class="form-control" formControlName="title" placeholder="What's your question?">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" formControlName="body" rows="4" placeholder="Describe your question in detail..."></textarea>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn--primary" type="submit" [disabled]="posting()">
              {{ posting() ? 'Posting...' : 'Post Thread' }}
            </button>
            <button class="btn btn--outline" type="button" (click)="showForm.set(false)">Cancel</button>
          </div>
        </form>
      </div>
    }

    <!-- Thread list -->
    @if (threads().length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">💬</div>
        <h3 class="empty-state__title">No threads yet</h3>
        <p class="empty-state__desc">Be the first to start a discussion!</p>
      </div>
    } @else {
      <div style="display:flex;flex-direction:column;gap:12px">
        @for (t of threads(); track t.threadId) {
          <a [routerLink]="['/courses', courseId, 'forum', t.threadId]" class="thread-card">
            <div class="thread-card__left">
              @if (t.isPinned) { <span class="pin-badge">📌 Pinned</span> }
              <h4>{{ t.title }}</h4>
              <p>{{ t.body | slice:0:120 }}{{ t.body.length > 120 ? '...' : '' }}</p>
              <div class="thread-meta">
                <span>👤 {{ t.authorName || 'User #' + t.authorId }}</span>
                <span>🕐 {{ t.createdAt | date:'mediumDate' }}</span>
                @if (t.isClosed) { <span class="badge badge--muted">Closed</span> }
              </div>
            </div>
            <div class="thread-card__right">
              <div class="reply-count">
                <strong>{{ t.replyCount || 0 }}</strong>
                <span>replies</span>
              </div>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .thread-card { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-decoration: none; color: inherit; transition: border-color .15s, box-shadow .15s; }
    .thread-card:hover { border-color: var(--primary); box-shadow: 0 4px 16px rgba(79,70,229,.08); }
    .thread-card__left { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .pin-badge { font-size: 12px; color: var(--warning); font-weight: 600; }
    .thread-card__left h4 { font-size: 15px; font-weight: 700; color: var(--text); }
    .thread-card__left p  { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
    .thread-meta { display: flex; gap: 16px; font-size: 12px; color: var(--text-muted); flex-wrap: wrap; }
    .thread-card__right { padding-left: 20px; text-align: center; }
    .reply-count strong { display: block; font-size: 20px; font-weight: 800; color: var(--primary); }
    .reply-count span   { font-size: 11px; color: var(--text-muted); }
  `]
})
export class ForumComponent implements OnInit {
  route       = inject(ActivatedRoute);
  discSvc     = inject(DiscussionService);
  auth        = inject(AuthService);
  toast       = inject(ToastService);
  fb          = inject(FormBuilder);

  courseId    = 0;
  threads     = signal<DiscussionThread[]>([]);
  showForm    = signal(false);
  posting     = signal(false);

  form = this.fb.group({
    title: ['', Validators.required],
    body:  ['', Validators.required],
  });

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('courseId')!;
    this.loadThreads();
  }

  loadThreads() {
    this.discSvc.getThreadsByCourse(this.courseId).subscribe(t => {
      this.threads.set(t.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)));
    });
  }

  createThread() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.posting.set(true);
    this.discSvc.createThread({ courseId: this.courseId, ...this.form.value } as any).subscribe({
      next: () => {
        this.posting.set(false); this.showForm.set(false); this.form.reset();
        this.toast.success('Thread created!'); this.loadThreads();
      },
      error: () => { this.posting.set(false); this.toast.error('Failed to create thread'); }
    });
  }
}
