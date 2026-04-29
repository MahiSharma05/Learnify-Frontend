import { Routes } from '@angular/router';
import { authGuard, adminGuard, instructorGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'auth',
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'oauth2/callback', loadComponent: () => import('./features/auth/oauth2-callback/oauth2-callback.component').then(m => m.OAuth2CallbackComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard',   loadComponent: () => import('./features/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent) },
      { path: 'courses',     loadComponent: () => import('./features/courses/course-list/course-list.component').then(m => m.CourseListComponent) },
      { path: 'courses/:id', loadComponent: () => import('./features/courses/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
      { path: 'courses/:id/learn', loadComponent: () => import('./features/courses/course-learn/course-learn.component').then(m => m.CourseLearnComponent) },
      { path: 'my-courses',  loadComponent: () => import('./features/student/my-courses/my-courses.component').then(m => m.MyCoursesComponent) },
      { path: 'my-progress', loadComponent: () => import('./features/student/my-progress/my-progress.component').then(m => m.MyProgressComponent) },
      { path: 'certificates',loadComponent: () => import('./features/student/certificates/certificates.component').then(m => m.CertificatesComponent) },
      { path: 'payments',    loadComponent: () => import('./features/payment/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent) },
      { path: 'subscription',loadComponent: () => import('./features/payment/subscription/subscription.component').then(m => m.SubscriptionComponent) },
      { path: 'quiz/:quizId/take',   loadComponent: () => import('./features/quiz/quiz-take/quiz-take.component').then(m => m.QuizTakeComponent) },
      { path: 'quiz/:quizId/result', loadComponent: () => import('./features/quiz/quiz-result/quiz-result.component').then(m => m.QuizResultComponent) },
      { path: 'courses/:courseId/forum', loadComponent: () => import('./features/discussion/forum/forum.component').then(m => m.ForumComponent) },
      { path: 'courses/:courseId/forum/:threadId', loadComponent: () => import('./features/discussion/thread-detail/thread-detail.component').then(m => m.ThreadDetailComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'profile',     loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent) },
      {
        path: 'instructor',
        canActivate: [instructorGuard],
        children: [
          { path: 'dashboard',  loadComponent: () => import('./features/instructor/instructor-dashboard/instructor-dashboard.component').then(m => m.InstructorDashboardComponent) },
          { path: 'courses',    loadComponent: () => import('./features/instructor/manage-courses/manage-courses.component').then(m => m.ManageCoursesComponent) },
          { path: 'courses/new',loadComponent: () => import('./features/instructor/course-form/course-form.component').then(m => m.CourseFormComponent) },
          { path: 'courses/:id/edit',    loadComponent: () => import('./features/instructor/course-form/course-form.component').then(m => m.CourseFormComponent) },
          { path: 'courses/:id/lessons', loadComponent: () => import('./features/instructor/manage-lessons/manage-lessons.component').then(m => m.ManageLessonsComponent) },
          { path: 'courses/:id/quizzes', loadComponent: () => import('./features/instructor/manage-quizzes/manage-quizzes.component').then(m => m.ManageQuizzesComponent) },
          { path: 'courses/:id/students',loadComponent: () => import('./features/instructor/student-progress/student-progress.component').then(m => m.StudentProgressComponent) },
          { path: 'analytics', loadComponent: () => import('./features/instructor/analytics/analytics.component').then(m => m.AnalyticsComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'dashboard',    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: 'users',        loadComponent: () => import('./features/admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent) },
          { path: 'courses',      loadComponent: () => import('./features/admin/manage-courses/manage-courses.component').then(m => m.AdminManageCoursesComponent) },
          { path: 'enrollments',  loadComponent: () => import('./features/admin/manage-enrollments/manage-enrollments.component').then(m => m.ManageEnrollmentsComponent) },
          { path: 'payments',     loadComponent: () => import('./features/admin/manage-payments/manage-payments.component').then(m => m.ManagePaymentsComponent) },
          { path: 'certificates', loadComponent: () => import('./features/admin/manage-certificates/manage-certificates.component').then(m => m.ManageCertificatesComponent) },
          { path: 'notifications',loadComponent: () => import('./features/admin/send-notifications/send-notifications.component').then(m => m.SendNotificationsComponent) },
          { path: 'discussions',  loadComponent: () => import('./features/admin/moderate-discussions/moderate-discussions.component').then(m => m.ModerateDiscussionsComponent) },
          { path: 'analytics',    loadComponent: () => import('./features/admin/platform-analytics/platform-analytics.component').then(m => m.PlatformAnalyticsComponent) },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: 'verify/:code', loadComponent: () => import('./features/student/verify-certificate/verify-certificate.component').then(m => m.VerifyCertificateComponent) },
  { path: '**', redirectTo: '' }
];
