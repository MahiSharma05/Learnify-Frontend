import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- NAVBAR -->
    <nav class="home-nav">
      <div class="home-nav__brand" routerLink="/">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#4f46e5"/>
          <path d="M6 10l8-4 8 4v2l-8 4-8-4v-2z" fill="white"/>
          <path d="M6 14l8 4 8-4" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
        <span>Learnify</span>
      </div>
      <div class="home-nav__links">
        <a routerLink="/courses">Explore</a>
        <a href="#features">Features</a>
      </div>
      <div class="home-nav__actions">
        @if (auth.isLoggedIn()) {
          <a routerLink="/dashboard" class="btn btn--primary">Go to Dashboard</a>
        } @else {
          <a routerLink="/auth/login"    class="btn btn--outline">Login</a>
          <a routerLink="/auth/register" class="btn btn--primary">Get Started</a>
        }
      </div>
    </nav>

    <!-- HERO -->
    <section class="hero">
      <div class="hero__content">
        <div class="hero__badge">🎓 Learn Anytime. Grow Everywhere.</div>
        <h1 class="hero__title">
          Master New Skills<br>
          <span class="hero__gradient">With Expert Instructors</span>
        </h1>
        <p class="hero__desc">
          Access thousands of courses, earn verifiable certificates, and join a community of
          learners transforming their careers with Learnify.
        </p>
        <div class="hero__search">
          <input type="text" [(ngModel)]="searchQ" placeholder="What do you want to learn?"
            (keyup.enter)="search()" class="hero__input" />
          <button class="btn btn--primary btn--lg" (click)="search()">Search Courses</button>
        </div>
        <div class="hero__stats">
          <div class="hero__stat"><strong>50K+</strong> Students</div>
          <div class="hero__stat"><strong>1,200+</strong> Courses</div>
          <div class="hero__stat"><strong>200+</strong> Instructors</div>
          <div class="hero__stat"><strong>4.8★</strong> Rating</div>
        </div>
      </div>
      <div class="hero__visual">
        <div class="hero__card-stack">
          <div class="float-card float-card--1">
            <span>🏆</span> Certificate Earned!
          </div>
          <div class="hero__graphic">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="40" width="320" height="220" rx="20" fill="#eef2ff"/>
              <rect x="60" y="60" width="140" height="90" rx="10" fill="#4f46e5" opacity=".15"/>
              <rect x="60" y="60" width="140" height="90" rx="10" fill="url(#grad)" opacity=".6"/>
              <rect x="220" y="60" width="120" height="40" rx="8" fill="#4f46e5" opacity=".1"/>
              <rect x="220" y="110" width="120" height="8" rx="4" fill="#e2e8f0"/>
              <rect x="220" y="124" width="90" height="8" rx="4" fill="#e2e8f0"/>
              <rect x="60" y="165" width="280" height="8" rx="4" fill="#e2e8f0"/>
              <rect x="60" y="181" width="220" height="8" rx="4" fill="#e2e8f0"/>
              <rect x="60" y="210" width="80" height="28" rx="8" fill="#4f46e5"/>
              <defs>
                <linearGradient id="grad" x1="60" y1="60" x2="200" y2="150" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#4f46e5"/>
                  <stop offset="1" stop-color="#0ea5e9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="float-card float-card--2">
            <span>📈</span> Progress: 78%
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section">
      <div class="container">
        <h2 class="section-title text-center">Browse by Category</h2>
        <div class="categories">
          @for (cat of categories; track cat.name) {
            <div class="cat-chip" (click)="browseCategory(cat.name)">
              <span>{{ cat.icon }}</span> {{ cat.name }}
            </div>
          }
        </div>
      </div>
    </section>

    <!-- FEATURED COURSES -->
    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Courses</h2>
          <a routerLink="/courses" class="btn btn--ghost">View All →</a>
        </div>
        @if (loading()) {
          <div class="courses-skeleton">
            @for (s of [1,2,3,4]; track s) {
              <div class="skeleton-card"></div>
            }
          </div>
        } @else {
          <div class="featured-grid">
            @for (course of featured(); track course.courseId) {
              <div class="feat-card" [routerLink]="['/courses', course.courseId]">
                <div class="feat-card__thumb">
                  <img [src]="course.thumbnailUrl || 'assets/default-course.svg'" [alt]="course.title">
                </div>
                <div class="feat-card__body">
                  <span class="badge badge--primary">{{ course.category }}</span>
                  <h3>{{ course.title }}</h3>
                  <p>{{ course.description | slice:0:90 }}...</p>
                  <div class="feat-card__footer">
                    <strong class="price">{{ course.price === 0 ? 'Free' : ('₹' + course.price) }}</strong>
                    <span class="badge badge--muted">{{ course.level }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- FEATURES -->
    <section class="section" id="features">
      <div class="container">
        <h2 class="section-title text-center">Why Choose Learnify?</h2>
        <div class="features-grid">
          @for (f of features; track f.title) {
            <div class="feature-card">
              <div class="feature-card__icon">{{ f.icon }}</div>
              <h3>{{ f.title }}</h3>
              <p>{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <h2>Ready to Start Learning?</h2>
          <p>Join over 50,000 students already learning on Learnify</p>
          <a routerLink="/auth/register" class="btn btn--primary btn--lg">Get Started — It's Free</a>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <div class="footer__brand">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#4f46e5"/>
            <path d="M6 10l8-4 8 4v2l-8 4-8-4v-2z" fill="white"/>
          </svg>
          Learnify
        </div>
        <p class="footer__copy">© 2026 Learnify Platform. Learn Anytime. Grow Everywhere.</p>
        <div class="footer__links">
          <a routerLink="/verify/code">Verify Certificate</a>
          <a routerLink="/courses">Browse Courses</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* Nav */
    .home-nav {
      display: flex; align-items: center; gap: 24px;
      padding: 0 32px; height: 64px;
      background: rgba(255,255,255,.95); backdrop-filter: blur(10px);
      border-bottom: 1px solid #e2e8f0;
      position: sticky; top: 0; z-index: 100;
    }
    .home-nav__brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; cursor: pointer; }
    .home-nav__links { display: flex; gap: 24px; }
    .home-nav__links a { font-size: 14px; color: #64748b; font-weight: 500; }
    .home-nav__links a:hover { color: #4f46e5; }
    .home-nav__actions { margin-left: auto; display: flex; gap: 10px; }

    /* Hero */
    .hero {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
      align-items: center; padding: 80px 32px;
      max-width: 1200px; margin: 0 auto;
    }
    .hero__badge { display: inline-flex; align-items: center; gap: 8px; background: #eef2ff; color: #4f46e5; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 99px; margin-bottom: 20px; }
    .hero__title { font-size: 52px; font-weight: 900; line-height: 1.1; color: #0f172a; margin-bottom: 20px; }
    .hero__gradient { background: linear-gradient(135deg, #4f46e5, #0ea5e9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero__desc { font-size: 17px; color: #64748b; line-height: 1.7; margin-bottom: 32px; max-width: 480px; }
    .hero__search { display: flex; gap: 10px; margin-bottom: 32px; }
    .hero__input { flex: 1; padding: 14px 18px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; outline: none; }
    .hero__input:focus { border-color: #4f46e5; }
    .hero__stats { display: flex; gap: 28px; }
    .hero__stat { font-size: 14px; color: #64748b; }
    .hero__stat strong { display: block; font-size: 22px; font-weight: 800; color: #0f172a; }
    .hero__visual { display: flex; align-items: center; justify-content: center; }
    .hero__card-stack { position: relative; width: 100%; }
    .hero__graphic { border-radius: 20px; overflow: hidden; box-shadow: 0 24px 80px rgba(79,70,229,.15); }
    .hero__graphic svg { width: 100%; display: block; }
    .float-card {
      position: absolute; background: #fff; border-radius: 12px; padding: 10px 16px;
      font-size: 13px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,.12);
      display: flex; align-items: center; gap: 8px; animation: float 3s ease-in-out infinite;
    }
    .float-card--1 { top: -16px; right: -10px; animation-delay: 0s; }
    .float-card--2 { bottom: -16px; left: -10px; animation-delay: 1.5s; }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

    /* Section */
    .section { padding: 80px 0; }
    .section--alt { background: #f8fafc; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .text-center { text-align: center; }
    .section-title { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 32px; }

    /* Categories */
    .categories { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .cat-chip { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 99px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s; }
    .cat-chip:hover { border-color: #4f46e5; color: #4f46e5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79,70,229,.1); }

    /* Featured Courses */
    .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 20px; }
    .feat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform .2s, box-shadow .2s; }
    .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,.1); }
    .feat-card__thumb { aspect-ratio: 16/9; overflow: hidden; background: #eef2ff; }
    .feat-card__thumb img { width: 100%; height: 100%; object-fit: cover; }
    .feat-card__body { padding: 16px; }
    .feat-card__body h3 { font-size: 15px; font-weight: 700; margin: 8px 0 6px; color: #0f172a; }
    .feat-card__body p { font-size: 13px; color: #64748b; margin-bottom: 12px; line-height: 1.5; }
    .feat-card__footer { display: flex; justify-content: space-between; align-items: center; }
    .price { font-size: 18px; font-weight: 800; color: #4f46e5; }

    /* Skeleton */
    .courses-skeleton { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 20px; }
    .skeleton-card { height: 280px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 14px; animation: shimmer 1.5s infinite; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Features */
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 20px; }
    .feature-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px; text-align: center; transition: transform .2s; }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,.08); }
    .feature-card__icon { font-size: 40px; margin-bottom: 16px; }
    .feature-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { font-size: 14px; color: #64748b; line-height: 1.6; }

    /* CTA */
    .cta-section { padding: 80px 0; }
    .cta-box { background: linear-gradient(135deg, #4f46e5, #0ea5e9); border-radius: 24px; padding: 60px; text-align: center; color: #fff; }
    .cta-box h2 { font-size: 36px; font-weight: 900; margin-bottom: 12px; }
    .cta-box p  { font-size: 17px; opacity: .85; margin-bottom: 28px; }
    .cta-box .btn--primary { background: #fff; color: #4f46e5; border-color: #fff; }
    .cta-box .btn--primary:hover { background: #f8fafc; }

    /* Footer */
    .footer { padding: 32px 0; border-top: 1px solid #e2e8f0; }
    .footer .container { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
    .footer__brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 16px; }
    .footer__copy { font-size: 13px; color: #64748b; flex: 1; text-align: center; }
    .footer__links { display: flex; gap: 16px; }
    .footer__links a { font-size: 13px; color: #64748b; }
    .footer__links a:hover { color: #4f46e5; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; padding: 40px 16px; }
      .hero__visual { display: none; }
      .hero__title { font-size: 36px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  auth    = inject(AuthService);
  courses = inject(CourseService);
  router  = inject(Router);

  searchQ  = '';
  loading  = signal(true);
  featured = signal<Course[]>([]);

  categories = [
    { name: 'Web Development', icon: '🌐' },
    { name: 'Data Science',    icon: '📊' },
    { name: 'Mobile Dev',      icon: '📱' },
    { name: 'AI & ML',         icon: '🤖' },
    { name: 'Cloud',           icon: '☁️' },
    { name: 'DevOps',          icon: '⚙️' },
    { name: 'Design',          icon: '🎨' },
    { name: 'Business',        icon: '💼' },
  ];

  features = [
    { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.' },
    { icon: '🏆', title: 'Verified Certificates', desc: 'Earn certificates with unique verification codes on course completion.' },
    { icon: '📱', title: 'Learn Anywhere', desc: 'Fully responsive platform works seamlessly on any device.' },
    { icon: '⏱',  title: 'Self-Paced Learning', desc: 'Learn at your own pace with lifetime access to course materials.' },
    { icon: '💬', title: 'Community Forums', desc: 'Engage with peers and instructors in course discussion forums.' },
    { icon: '📈', title: 'Track Progress', desc: 'Visual progress tracking with detailed analytics on your learning.' },
  ];

  ngOnInit() {
    this.courses.getFeaturedCourses().subscribe({
      next:  c => { this.featured.set(c.slice(0, 8)); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  search() {
    if (this.searchQ.trim()) {
      this.router.navigate(['/courses'], { queryParams: { keyword: this.searchQ } });
    }
  }

  browseCategory(cat: string) {
    this.router.navigate(['/courses'], { queryParams: { category: cat } });
  }
}
