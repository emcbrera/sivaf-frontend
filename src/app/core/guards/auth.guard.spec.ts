import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  PartialMatchRouteSnapshot,
  provideRouter,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { SessionService } from '../services/session.service';
import { authGuard, authMatchGuard } from './auth.guard';

describe('Authentication guards', () => {
  const authenticatedState = signal(false);

  let router: Router;

  beforeEach(() => {
    authenticatedState.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            isAuthenticated: authenticatedState.asReadonly(),
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow route activation with an active session', () => {
    authenticatedState.set(true);

    const result = runAuthGuard('/photo-upload-home');

    expect(result).toBe(true);
  });

  it('should redirect route activation to login without a session', () => {
    const result = runAuthGuard('/photo-upload-home') as UrlTree;

    expect(router.serializeUrl(result)).toContain('/login');
    expect(result.queryParams['returnUrl']).toBe('/photo-upload-home');
  });

  it('should allow protected route matching with an active session', () => {
    authenticatedState.set(true);

    const result = runAuthMatchGuard('photo-upload-home');

    expect(result).toBe(true);
  });

  it('should redirect protected route matching without a session', () => {
    const result = runAuthMatchGuard('photo-upload-home') as UrlTree;

    expect(router.serializeUrl(result)).toContain('/login');
    expect(result.queryParams['returnUrl']).toBe('/photo-upload-home');
  });

  function runAuthGuard(url: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        authGuard(
          {} as ActivatedRouteSnapshot,
          { url } as RouterStateSnapshot,
        ) as boolean | UrlTree,
    );
  }

  function runAuthMatchGuard(path: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        authMatchGuard(
          {} as Route,
          [new UrlSegment(path, {})],
          {} as PartialMatchRouteSnapshot,
        ) as boolean | UrlTree,
    );
  }
});
