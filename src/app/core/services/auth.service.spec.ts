import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {

  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create auth service', () => {
    expect(service).toBeTruthy();
  });

  it('should register user', () => {

    const mockResponse = {
  token: 'abc123',
  userId: 1,
  fullName: 'Mahi Sharma',
  email: 'mahi@test.com',
  role: 'STUDENT' as const
};

    service.register({
      fullName: 'Mahi',
      email: 'mahi@test.com',
      password: '123456'
    } as any).subscribe(res => {

      expect(res.token).toBe('abc123');

    });

    const req = httpMock.expectOne(
      `${environment.apiGateway}/api/auth/register`
    );

    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);

  });

  it('should login user', () => {

    const mockResponse = {
      token: 'abc123',
      email: 'mahi@test.com',
      role: 'STUDENT'
    };

    service.login({
      email: 'mahi@test.com',
      password: '123456'
    }).subscribe(res => {

      expect(res.token).toBe('abc123');

    });

    const req = httpMock.expectOne(
      `${environment.apiGateway}/api/auth/login`
    );

    expect(req.request.method).toBe('POST');

    req.flush(mockResponse);

  });

  it('should remove token on logout', () => {

    localStorage.setItem('learnify_token', 'abc123');

    service.logout();

    expect(localStorage.getItem('learnify_token')).toBeNull();

  });

  it('should navigate to login after logout', () => {

    service.logout();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);

  });

  it('should get user profile', () => {

    const mockUser = {
  userId: 1,
  fullName: 'Mahi Sharma',
  email: 'mahi@test.com',
  role: 'STUDENT' as const
};

    service.getProfile().subscribe(user => {

      expect(user.email).toBe('mahi@test.com');
      expect(user.role).toBe('STUDENT');

    });

    const req = httpMock.expectOne(
      `${environment.apiGateway}/api/auth/profile`
    );

    expect(req.request.method).toBe('GET');

    req.flush(mockUser);

  });

});