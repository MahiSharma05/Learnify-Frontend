import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="course-card" [class.enrolled]="enrolled">
      <div class="course-card__thumb" [routerLink]="['/courses', course.courseId]">
        <img [src]="course.thumbnailUrl || 'assets/course-default.svg'" [alt]="course.title" loading="lazy">
        <span class="course-card__level">{{ course.level }}</span>
        @if (!course.isPublished) {
          <span class="course-card__badge draft">Draft</span>
        }
      </div>
      <div class="course-card__body">
        <span class="course-card__cat">{{ course.category }}</span>
        <h3 class="course-card__title" [routerLink]="['/courses', course.courseId]">{{ course.title }}</h3>
        <p class="course-card__desc">{{ course.description | slice:0:80 }}...</p>
        <div class="course-card__meta">
          <span class="course-card__lang">🌐 {{ course.language || 'English' }}</span>
          @if (course.totalDuration) {
            <span>⏱ {{ course.totalDuration }}min</span>
          }
        </div>
        <div class="course-card__footer">
          <span class="course-card__price">
            {{ course.price === 0 ? 'Free' : ('₹' + course.price) }}
          </span>
          @if (showActions) {
            <div class="course-card__actions">
              @if (enrolled) {
                <button class="btn btn--sm btn--outline" [routerLink]="['/courses', course.courseId, 'learn']">Continue</button>
              } @else {
                <button class="btn btn--sm btn--primary" (click)="enroll.emit(course)">Enroll</button>
              }
            </div>
          }
          @if (showEdit) {
            <div class="course-card__actions">
              <button class="btn btn--sm btn--outline" (click)="edit.emit(course)">Edit</button>
              <button class="btn btn--sm btn--danger" (click)="delete.emit(course)">Delete</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: transform .2s, box-shadow .2s;
      cursor: pointer;
    }
    .course-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.12); }
    .course-card__thumb { position: relative; aspect-ratio: 16/9; overflow: hidden; }
    .course-card__thumb img { width: 100%; height: 100%; object-fit: cover; }
    .course-card__level {
      position: absolute; top: 8px; left: 8px;
      background: rgba(0,0,0,.6); color: #fff;
      font-size: 11px; padding: 3px 8px; border-radius: 20px;
    }
    .course-card__badge {
      position: absolute; top: 8px; right: 8px;
      font-size: 11px; padding: 3px 8px; border-radius: 20px; font-weight: 600;
    }
    .draft { background: #fbbf24; color: #78350f; }
    .course-card__body { padding: 16px; }
    .course-card__cat { font-size: 11px; color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
    .course-card__title { font-size: 15px; font-weight: 700; margin: 6px 0 6px; color: var(--text); line-height: 1.3; cursor: pointer; }
    .course-card__title:hover { color: var(--primary); }
    .course-card__desc { font-size: 13px; color: var(--text-muted); margin: 0 0 10px; line-height: 1.5; }
    .course-card__meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
    .course-card__footer { display: flex; justify-content: space-between; align-items: center; }
    .course-card__price { font-size: 16px; font-weight: 700; color: var(--primary); }
    .course-card__actions { display: flex; gap: 8px; }
    .enrolled { border-color: var(--primary); }
  `]
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() enrolled = false;
  @Input() showActions = true;
  @Input() showEdit = false;
  @Output() enroll = new EventEmitter<Course>();
  @Output() edit   = new EventEmitter<Course>();
  @Output() delete = new EventEmitter<Course>();
}
