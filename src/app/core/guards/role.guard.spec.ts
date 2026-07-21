import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  PartialMatchRouteSnapshot,
  provideRouter,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { SessionService } from '../services/session.service';
import { academicRoleGuard, academicRoleMatchGuard } from './role.guard';

describe('Academic role guards', () => {
  let hasAcademicRole: boolean;
  let clearSpy: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    hasAcademicRole = false;
    clearSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            hasAnyRole: () => hasAcademicRole,
            clear: clearSpy,
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should activate the route with an academic role', () => {
    hasAcademicRole = true;

    expect(runActivateGuard()).toBe(true);
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it('should clear and redirect a session without an academic role', () => {
    const result = runActivateGuard() as UrlTree;

    expect(clearSpy).toHaveBeenCalledOnce();
    expect(router.serializeUrl(result)).toContain('/login');
    expect(result.queryParams['reason']).toBe('unauthorized');
  });

  it('should match the route with an academic role', () => {
    hasAcademicRole = true;

    expect(runMatchGuard()).toBe(true);
  });

  it('should reject route matching without an academic role', () => {
    const result = runMatchGuard() as UrlTree;

    expect(clearSpy).toHaveBeenCalledOnce();
    expect(result.queryParams['reason']).toBe('unauthorized');
  });

  function runActivateGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        academicRoleGuard(
          {} as ActivatedRouteSnapshot,
          {} as RouterStateSnapshot,
        ) as boolean | UrlTree,
    );
  }

  function runMatchGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        academicRoleMatchGuard(
          {} as Route,
          [],
          {} as PartialMatchRouteSnapshot,
        ) as boolean | UrlTree,
    );
  }
});
