import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL, AUTH_API_PATHS } from '../config/api.config';
import { SessionService } from '../services/session.service';

const DEFAULT_PROTECTED_ROUTE = '/photo-upload-home';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const session = inject(SessionService);
  const router = inject(Router);

  const isApiRequest =
    request.url === apiBaseUrl || request.url.startsWith(`${apiBaseUrl}/`);
  const isLoginRequest =
    request.url === `${apiBaseUrl}${AUTH_API_PATHS.login}`;
  const isLogoutRequest =
    request.url === `${apiBaseUrl}${AUTH_API_PATHS.logout}`;
  const token = session.token();

  const authenticatedRequest =
    isApiRequest && !isLoginRequest && token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      const sessionWasRejected =
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isLoginRequest &&
        !isLogoutRequest &&
        session.token() !== null;

      if (sessionWasRejected) {
        session.clear();

        void router.navigate(['/login'], {
          queryParams: {
            returnUrl: getSafeReturnUrl(router.url),
          },
        });
      }

      return throwError(() => error);
    }),
  );
};

const getSafeReturnUrl = (currentUrl: string): string =>
  currentUrl.startsWith('/') &&
  !currentUrl.startsWith('//') &&
  !currentUrl.startsWith('/login')
    ? currentUrl
    : DEFAULT_PROTECTED_ROUTE;
