import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProgressService } from '../../../core/services/progress.service';
import { Certificate } from '../../../core/models';

@Component({
  selector: 'app-certificate-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cert-page" *ngIf="cert()">
      <div class="cert-box">
        <h1>🎓 Certificate of Completion</h1>

        <p>This certifies that</p>
        <h2>{{ cert()?.studentName || 'Student' }}</h2>

        <p>has successfully completed</p>
        <h3>{{ cert()?.courseName }}</h3>

        <p>Instructor: {{ cert()?.instructorName }}</p>
        <p>Issued: {{ cert()?.issuedAt | date:'longDate' }}</p>

        <div class="code">
          Code: {{ cert()?.verificationCode }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cert-page {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    .cert-box {
      border: 2px solid #4f46e5;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      width: 600px;
      background: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    h1 { color: #4f46e5; }
    h2 { font-size: 28px; margin: 10px 0; }
    h3 { font-size: 22px; margin: 10px 0; }

    .code {
      margin-top: 20px;
      font-weight: bold;
      color: #0ea5e9;
    }
  `]
})
export class CertificateViewComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private progressService = inject(ProgressService);

  cert = signal<Certificate | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.progressService.getMyCertificates().subscribe(list => {
      const found = list.find(c => c.id === id);
      this.cert.set(found || null);
    });
  }
}