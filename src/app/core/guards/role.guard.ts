import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';

import { ACADEMIC_ACCESS_ROLES } from '../config/role-access.config';
import { SessionService } from '../services/session.service';

const createAccessDeniedRedirect = (
  session: SessionService,
  router: Router,
): UrlTree => {
  session.clear();

  return router.createUrlTree(['/login'], {
    queryParams: { reason: 'unauthorized' },
  });
};

export const academicRoleGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.hasAnyRole(ACADEMIC_ACCESS_ROLES)
    ? true
    : createAccessDeniedRedirect(session, router);
};

export const academicRoleMatchGuard: CanMatchFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);

  return session.hasAnyRole(ACADEMIC_ACCESS_ROLES)
    ? true
    : createAccessDeniedRedirect(session, router);
};
