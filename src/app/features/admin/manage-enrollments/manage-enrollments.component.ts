import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment } from '../../../core/models';

@Component({
  selector: 'app-manage-enrollments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">All Enrollments</h1>
    <p class="page-subtitle">{{ enrollments().length }} total enrollments</p>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Student</th><th>Course</th><th>Progress</th><th>Status</th><th>Enrolled</th><th>Certificate</th></tr>
          </thead>
          <tbody>
            @for (e of enrollments(); track e.enrollmentId) {
              <tr>
                <td style="font-size:12px;color:var(--text-muted)">#{{ e.enrollmentId }}</td>
                <td>Student #{{ e.studentId }}</td>
                <td>Course #{{ e.courseId }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:80px"><div class="progress-bar__fill" [style.width.%]="e.progressPercent"></div></div>
                    {{ e.progressPercent }}%
                  </div>
                </td>
                <td>
                  <span class="badge" [class]="e.status==='COMPLETED'?'badge--success':e.status==='CANCELLED'?'badge--danger':'badge--primary'">{{ e.status }}</span>
                </td>
                <td style="color:var(--text-muted)">{{ e.enrolledAt | date:'mediumDate' }}</td>
                <td>{{ e.certificateIssued ? '🏆 Yes' : '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManageEnrollmentsComponent implements OnInit {
  enrollService = inject(EnrollmentService);
  enrollments   = signal<Enrollment[]>([]);
  ngOnInit() { this.enrollService.getAllEnrollments().subscribe(e => this.enrollments.set(e)); }
}
