// ── Auth Models ──────────────────────────────────────────────────────────────
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  profilePicUrl?: string;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  provider?: string;
  mobile?: string;
  bio?: string;
  profilePicUrl?: string;
  createdAt?: string;
}

// ── Course Models ─────────────────────────────────────────────────────────────
export interface Course {
  courseId: number;
  title: string;
  description: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  instructorId: number;
  instructorName?: string;
  thumbnailUrl?: string;
  totalDuration?: number;
  isPublished: boolean;
  createdAt?: string;
  language?: string;
  totalEnrollments?: number;
  rating?: number;
}

export interface CourseRequest {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  thumbnailUrl?: string;
  language?: string;
}

// ── Lesson Models ─────────────────────────────────────────────────────────────
export interface Lesson {
  lessonId: number;
  courseId: number;
  title: string;
  contentType: 'VIDEO' | 'ARTICLE' | 'PDF';
  contentUrl: string;
  durationMinutes: number;
  orderIndex: number;
  description?: string;
  isPreview: boolean;
}

export interface LessonRequest {
  courseId: number;
  title: string;
  contentType: string;
  contentUrl: string;
  durationMinutes: number;
  orderIndex: number;
  description?: string;
  isPreview: boolean;
}

export interface Resource {
  resourceId: number;
  lessonId: number;
  name: string;
  fileUrl: string;
  fileType: string;
  sizeKb: number;
}

// ── Enrollment Models ─────────────────────────────────────────────────────────
export interface Enrollment {
  enrollmentId: number;
  studentId: number;
  courseId: number;
  enrolledAt: string;
  completedAt?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progressPercent: number;
  certificateIssued: boolean;
  courseTitle?: string;
  courseThumbnail?: string;
}

// ── Quiz / Assessment Models ──────────────────────────────────────────────────
export interface Quiz {
  quizId: number;
  courseId: number;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts: number;
  isPublished: boolean;
  totalQuestions?: number;
}

export interface QuizRequest {
  courseId: number;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts: number;
}

export interface Question {
  questionId: number;
  quizId: number;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE';
  options: string[];
  correctAnswer: string;
  marks: number;
  orderIndex: number;
}

export interface QuestionRequest {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  orderIndex: number;
}

export interface Attempt {
  attemptId: number;
  quizId: number;
  studentId: number;
  score: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  answers?: Record<number, string>;
}

export interface AttemptRequest {
  answers: Record<number, string>;
}

// ── Payment Models ─────────────────────────────────────────────────────────────
export interface Payment {
  paymentId: number;
  studentId: number;
  courseId: number;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  mode: string;
  transactionId: string;
  paidAt: string;
  currency: string;
}

export interface PaymentRequest {
  courseId: number;
  amount: number;
  mode: string;
  currency?: string;
}

export interface Subscription {
  subscriptionId: number;
  studentId: number;
  plan: 'FREE' | 'MONTHLY' | 'ANNUAL';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  amountPaid: number;
  autoRenew: boolean;
}

// ── Progress / Certificate Models ─────────────────────────────────────────────
export interface Progress {
  progressId: number;
  studentId: number;
  courseId: number;
  lessonId: number;
  watchedSeconds: number;
  isCompleted: boolean;
  lastAccessedAt: string;
  completedAt?: string;
}

export interface Certificate {
  certificateId: number;
  studentId: number;
  courseId: number;
  issuedAt: string;
  certificateUrl: string;
  verificationCode: string;
  instructorName: string;
  courseName: string;
}

// ── Discussion Models ──────────────────────────────────────────────────────────
export interface DiscussionThread {
  threadId: number;
  courseId: number;
  lessonId?: number;
  authorId: number;
  authorName?: string;
  title: string;
  body: string;
  isPinned: boolean;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

export interface ThreadRequest {
  courseId: number;
  lessonId?: number;
  title: string;
  body: string;
}

export interface Reply {
  replyId: number;
  threadId: number;
  authorId: number;
  authorName?: string;
  body: string;
  isAccepted: boolean;
  upvotes: number;
  createdAt: string;
}

export interface ReplyRequest {
  body: string;
}

// ── Notification Models ────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  userEmail?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  emailSent: boolean;
}

export interface NotificationRequest {
  userId: number;
  userEmail?: string;
  type: string;
  title: string;
  message: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
  sendEmail?: boolean;
}

// ── Common ────────────────────────────────────────────────────────────────────
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
