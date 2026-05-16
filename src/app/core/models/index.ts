declare var Razorpay: any;
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
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  instructorId: number;
  instructorName?: string;
  thumbnailUrl?: string;
  totalDuration?: number;
  published: boolean;
  createdAt?: string;
  language?: string;
  totalEnrollments?: number;
  rating?: number;
  approvalStatus?: string;
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
  id: number;             // ← backend uses "id", not "enrollmentId"
  enrollmentId?: number;  // keep as optional alias for backward compat
  studentId: number;
  courseId: number;
  studentEmail?: string;
  courseTitle?: string;
  courseThumbnail?: string;
  enrolledAt: string;
  completedAt?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progressPercent: number;
  certificateIssued: boolean;
  certificateUrl?: string;
}

// ── Quiz / Assessment Models ──────────────────────────────────────────────────
export interface Quiz {
  id: number;
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
  id: number;
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
  id: number;           // ← backend returns "id"
  paymentId?: number;   // optional alias
  studentId: number;
  studentEmail?: string;
  courseId?: number;
  courseTitle?: string;
  amount: number;
  currency: string;
  mode: string;
  status: string;
  transactionId: string;
  paidAt: string;
  failureReason?: string;
  refundedAt?: string;
}

export interface PaymentRequest {
  courseId: number;
  amount: number;
  mode: string;
  currency?: string;
}

export interface Subscription {
  id: number;              // ← backend returns "id"
  subscriptionId?: number; // optional alias
  studentId: number;
  studentEmail?: string;
  plan: 'FREE' | 'MONTHLY' | 'ANNUAL';
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  autoRenew: boolean;
  active?: boolean;
  daysRemaining?: number;
  paymentId?: number;
  createdAt?: string;
  cancelledAt?: string;
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
  id: number;              // ← backend returns "id"
  certificateId?: number;  // optional alias
  studentId: number;
  studentEmail?: string;
  studentName?: string;
  courseId: number;
  courseName: string;
  instructorName: string;
  verificationCode: string;
  certificateUrl: string;
  issuedAt: string;
  issuedDate?: string;
  enteredCode?: string;
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
