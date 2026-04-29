import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DiscussionService } from '../../../core/services/discussion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { DiscussionThread, Reply } from '../../../core/models';

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <button class="btn btn--ghost" style="margin-bottom:16px" onclick="history.back()">← Back to Forum</button>

    @if (thread()) {
      <div class="thread-header card" style="margin-bottom:20px">
        @if (thread()!.isPinned) { <span class="badge badge--warning" style="margin-bottom:8px">📌 Pinned</span> }
        @if (thread()!.isClosed) { <span class="badge badge--muted" style="margin-left:8px">Closed</span> }
        <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">{{ thread()!.title }}</h1>
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:12px">
          By {{ thread()!.authorName || 'User #' + thread()!.authorId }} · {{ thread()!.createdAt | date:'medium' }}
        </p>
        <div style="font-size:15px;line-height:1.7;color:var(--text)">{{ thread()!.body }}</div>

        @if (canModerate()) {
          <div style="margin-top:16px;display:flex;gap:8px">
            <button class="btn btn--outline btn--sm" (click)="pin()">📌 Pin</button>
            <button class="btn btn--outline btn--sm" (click)="close()">🔒 Close</button>
            <button class="btn btn--danger btn--sm"  (click)="deleteThread()">Delete</button>
          </div>
        }
      </div>

      <!-- Replies -->
      <h3 style="font-size:16px;font-weight:700;margin-bottom:16px">
        {{ replies().length }} {{ replies().length === 1 ? 'Reply' : 'Replies' }}
      </h3>

      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">
        @for (r of replies(); track r.replyId) {
          <div class="reply-card" [class.accepted]="r.isAccepted">
            @if (r.isAccepted) {
              <div class="accepted-badge">✓ Accepted Answer</div>
            }
            <div class="reply-card__header">
              <div class="avatar-sm">{{ (r.authorName || 'U')[0].toUpperCase() }}</div>
              <div>
                <strong style="font-size:14px">{{ r.authorName || 'User #' + r.authorId }}</strong>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">{{ r.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>
            <p style="font-size:14px;line-height:1.7;color:var(--text);margin:10px 0">{{ r.body }}</p>
            <div class="reply-card__actions">
              <button class="btn btn--ghost btn--sm" (click)="upvote(r.replyId)">
                👍 {{ r.upvotes }}
              </button>
              @if (canModerate() && !r.isAccepted) {
                <button class="btn btn--ghost btn--sm" (click)="accept(r.replyId)">✓ Accept</button>
              }
              @if (canModerate()) {
                <button class="btn btn--danger btn--sm" (click)="deleteReply(r.replyId)">Delete</button>
              }
            </div>
          </div>
        }
      </div>

      <!-- Reply Form -->
      @if (!thread()!.isClosed) {
        <div class="card">
          <h4 style="font-size:15px;font-weight:700;margin-bottom:14px">Post a Reply</h4>
          <form [formGroup]="form" (ngSubmit)="postReply()">
            <div class="form-group">
              <textarea class="form-control" formControlName="body" rows="4"
                placeholder="Write your reply..."></textarea>
              @if (form.get('body')?.touched && form.get('body')?.errors) {
                <span class="form-error">Reply cannot be empty</span>
              }
            </div>
            <button class="btn btn--primary" type="submit" [disabled]="posting()">
              {{ posting() ? 'Posting...' : 'Post Reply' }}
            </button>
          </form>
        </div>
      } @else {
        <div class="card" style="text-align:center;color:var(--text-muted)">
          🔒 This thread is closed. No new replies allowed.
        </div>
      }
    }
  `,
  styles: [`
    .reply-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
    .reply-card.accepted { border-color: var(--success); background: #f0fdf4; }
    .accepted-badge { font-size: 12px; font-weight: 700; color: var(--success); margin-bottom: 8px; }
    .reply-card__header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .reply-card__actions { display: flex; gap: 8px; margin-top: 8px; }
  `]
})
export class ThreadDetailComponent implements OnInit {
  route   = inject(ActivatedRoute);
  discSvc = inject(DiscussionService);
  auth    = inject(AuthService);
  toast   = inject(ToastService);
  fb      = inject(FormBuilder);

  thread   = signal<DiscussionThread | null>(null);
  replies  = signal<Reply[]>([]);
  posting  = signal(false);
  threadId = 0;
  courseId = 0;

  form = this.fb.group({ body: ['', Validators.required] });

  get canModerate() {
    return () => this.auth.isInstructor() || this.auth.isAdmin() ||
      this.auth.user()?.userId === this.thread()?.authorId;
  }

  ngOnInit() {
    this.courseId  = +this.route.snapshot.paramMap.get('courseId')!;
    this.threadId  = +this.route.snapshot.paramMap.get('threadId')!;
    this.discSvc.getThreadById(this.threadId).subscribe(t => this.thread.set(t));
    this.loadReplies();
  }

  loadReplies() {
    this.discSvc.getRepliesByThread(this.threadId).subscribe(r => this.replies.set(r));
  }

  postReply() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.posting.set(true);
    this.discSvc.postReply(this.threadId, { body: this.form.value.body! }).subscribe({
      next: () => { this.posting.set(false); this.form.reset(); this.toast.success('Reply posted!'); this.loadReplies(); },
      error: () => { this.posting.set(false); this.toast.error('Failed to post reply'); }
    });
  }

  upvote(id: number) { this.discSvc.upvoteReply(id).subscribe(() => this.loadReplies()); }
  accept(id: number) { this.discSvc.acceptReply(id).subscribe(() => this.loadReplies()); }
  pin()   { this.discSvc.pinThread(this.threadId).subscribe(() => this.toast.success('Thread pinned')); }
  close() { this.discSvc.closeThread(this.threadId).subscribe(() => { this.toast.success('Thread closed'); this.discSvc.getThreadById(this.threadId).subscribe(t => this.thread.set(t)); }); }
  deleteThread() { this.discSvc.deleteThread(this.threadId).subscribe(() => { this.toast.success('Thread deleted'); history.back(); }); }
  deleteReply(id: number) { this.discSvc.deleteReply(id).subscribe(() => { this.toast.success('Reply deleted'); this.loadReplies(); }); }
}
