import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanMatchFn,
  Router,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { SessionService } from '../services/session.service';

const DEFAULT_PROTECTED_ROUTE = '/photo-upload-home';

const createLoginRedirect = (
  router: Router,
  returnUrl: string,
): UrlTree =>
  router.createUrlTree(['/login'], {
    queryParams: { returnUrl },
  });

export const authGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.isAuthenticated()
    ? true
    : createLoginRedirect(router, state.url);
};

export const authMatchGuard: CanMatchFn = (_route, segments) => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.isAuthenticated()
    ? true
    : createLoginRedirect(router, buildRequestedUrl(segments));
};

const buildRequestedUrl = (segments: readonly UrlSegment[]): string => {
  const path = segments.map((segment) => segment.path).join('/');

  return path.length > 0 ? `/${path}` : DEFAULT_PROTECTED_ROUTE;
};
