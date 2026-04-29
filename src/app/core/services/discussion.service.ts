import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiscussionThread, ThreadRequest, Reply, ReplyRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class DiscussionService {
  private threadBase = `${environment.apiGateway}/api/threads`;
  private replyBase  = `${environment.apiGateway}/api/replies`;

  constructor(private http: HttpClient) {}

  // Threads
  getThreadsByCourse(courseId: number): Observable<DiscussionThread[]> {
    return this.http.get<DiscussionThread[]>(`${this.threadBase}/course/${courseId}`);
  }

  getThreadById(threadId: number): Observable<DiscussionThread> {
    return this.http.get<DiscussionThread>(`${this.threadBase}/${threadId}`);
  }

  createThread(req: ThreadRequest): Observable<DiscussionThread> {
    return this.http.post<DiscussionThread>(this.threadBase, req);
  }

  pinThread(threadId: number): Observable<void> {
    return this.http.put<void>(`${this.threadBase}/${threadId}/pin`, {});
  }

  closeThread(threadId: number): Observable<void> {
    return this.http.put<void>(`${this.threadBase}/${threadId}/close`, {});
  }

  deleteThread(threadId: number): Observable<void> {
    return this.http.delete<void>(`${this.threadBase}/${threadId}`);
  }

  // Replies
  getRepliesByThread(threadId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.replyBase}/thread/${threadId}`);
  }

  postReply(threadId: number, req: ReplyRequest): Observable<Reply> {
    return this.http.post<Reply>(`${this.replyBase}/thread/${threadId}`, req);
  }

  upvoteReply(replyId: number): Observable<Reply> {
    return this.http.put<Reply>(`${this.replyBase}/${replyId}/upvote`, {});
  }

  acceptReply(replyId: number): Observable<Reply> {
    return this.http.put<Reply>(`${this.replyBase}/${replyId}/accept`, {});
  }

  deleteReply(replyId: number): Observable<void> {
    return this.http.delete<void>(`${this.replyBase}/${replyId}`);
  }

  // Admin
  getAllThreads(): Observable<DiscussionThread[]> {
    return this.http.get<DiscussionThread[]>(`${this.threadBase}/all`);
  }
}
