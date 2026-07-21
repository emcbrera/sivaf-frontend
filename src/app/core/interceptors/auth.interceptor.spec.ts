import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { API_BASE_URL } from '../config/api.config';
import { SessionService } from '../services/session.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const apiBaseUrl = 'http://api.example.test/api/v1';
  const protectedUrl = `${apiBaseUrl}/photos/`;
  const loginUrl = `${apiBaseUrl}/auth/login/`;
  const fakeToken = 'token-ficticio';
  const tokenState = signal<string | null>(null);

  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let clearSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    tokenState.set(null);
    clearSpy = vi.fn(() => tokenState.set(null));
    navigateSpy = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: apiBaseUrl,
        },
        {
          provide: SessionService,
          useValue: {
            token: tokenState.asReadonly(),
            clear: clearSpy,
          },
        },
        {
          provide: Router,
          useValue: {
            url: '/photo-upload-home',
            navigate: navigateSpy,
          },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add the bearer token to requests sent to the API', () => {
    tokenState.set(fakeToken);

    http.get(protectedUrl).subscribe();

    const request = httpTesting.expectOne(protectedUrl);

    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${fakeToken}`,
    );
    request.flush({});
  });

  it('should not add the bearer token to the login request', () => {
    tokenState.set(fakeToken);

    http.post(loginUrl, {}).subscribe({ error: () => undefined });

    const request = httpTesting.expectOne(loginUrl);

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(
      { detail: 'Credenciales inválidas.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    expect(clearSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not add an authorization header without a session', () => {
    http.get(protectedUrl).subscribe();

    const request = httpTesting.expectOne(protectedUrl);

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should not send the token to an external origin', () => {
    tokenState.set(fakeToken);
    const externalUrl = 'https://external.example/resource';

    http.get(externalUrl).subscribe();

    const request = httpTesting.expectOne(externalUrl);

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should preserve existing request headers', () => {
    tokenState.set(fakeToken);

    http
      .get(protectedUrl, {
        headers: { 'X-Request-Source': 'frontend' },
      })
      .subscribe();

    const request = httpTesting.expectOne(protectedUrl);

    expect(request.request.headers.get('X-Request-Source')).toBe('frontend');
    expect(request.request.headers.get('Authorization')).toBe(
      `Bearer ${fakeToken}`,
    );
    request.flush({});
  });

  it('should clear and redirect a session rejected by the API', () => {
    tokenState.set(fakeToken);
    let receivedStatus: number | undefined;

    http.get(protectedUrl).subscribe({
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      },
    });

    httpTesting.expectOne(protectedUrl).flush(
      { detail: 'Token inválido.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/photo-upload-home' },
    });
    expect(receivedStatus).toBe(401);
  });

  it('should avoid duplicate redirects for concurrent 401 responses', () => {
    tokenState.set(fakeToken);

    http.get(`${protectedUrl}first`).subscribe({ error: () => undefined });
    http.get(`${protectedUrl}second`).subscribe({ error: () => undefined });

    httpTesting.expectOne(`${protectedUrl}first`).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
    httpTesting.expectOne(`${protectedUrl}second`).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });
});
