import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../../core/services/progress.service';
import { Certificate } from '../../../core/models';

@Component({
  selector: 'app-manage-certificates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">All Certificates</h1>
    <p class="page-subtitle">{{ certs().length }} certificates issued</p>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Student</th><th>Course</th><th>Instructor</th><th>Issued</th><th>Code</th><th>Verify</th></tr>
          </thead>
          <tbody>
            @for (c of certs(); track c.certificateId) {
              <tr>
                <td style="color:var(--text-muted)">#{{ c.certificateId }}</td>
                <td>#{{ c.studentId }}</td>
                <td style="font-weight:600">{{ c.courseName }}</td>
                <td style="color:var(--text-muted)">{{ c.instructorName }}</td>
                <td style="color:var(--text-muted)">{{ c.issuedAt | date:'mediumDate' }}</td>
                <td><code style="font-size:11px;color:var(--primary)">{{ c.verificationCode | slice:0:12 }}...</code></td>
                <td>
                  <a [href]="'/verify/' + c.verificationCode" target="_blank" class="btn btn--ghost btn--sm">🔗 Verify</a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ManageCertificatesComponent implements OnInit {
  progressService = inject(ProgressService);
  certs = signal<Certificate[]>([]);
  ngOnInit() { this.progressService.getAllCertificates().subscribe(c => this.certs.set(c)); }
}
