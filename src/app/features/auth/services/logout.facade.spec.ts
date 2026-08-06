import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { SessionService } from '../../../core/services/session.service';
import { LogoutResponse } from '../models/logout-response.model';
import { AuthApiService } from './auth-api.service';
import { LogoutFacade } from './logout.facade';

describe('LogoutFacade', () => {
  const validResponse: LogoutResponse = {
    detail: 'Sesión cerrada correctamente.',
  };

  let facade: LogoutFacade;
  let logoutSpy: ReturnType<
    typeof vi.fn<() => Observable<LogoutResponse>>
  >;
  let sessionClearSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    logoutSpy = vi.fn(() => of(validResponse));
    sessionClearSpy = vi.fn();
    navigateByUrlSpy = vi.fn(() => Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        LogoutFacade,
        {
          provide: AuthApiService,
          useValue: { logout: logoutSpy },
        },
        {
          provide: SessionService,
          useValue: { clear: sessionClearSpy },
        },
        {
          provide: Router,
          useValue: { navigateByUrl: navigateByUrlSpy },
        },
      ],
    });

    facade = TestBed.inject(LogoutFacade);
  });

  it('should clear the session and replace the current history entry', () => {
    facade.logout();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(sessionClearSpy).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login', {
      replaceUrl: true,
    });
    expect(facade.isLoggingOut()).toBe(false);
  });

  it('should ignore duplicate requests while logout is pending', () => {
    const pendingRequest = new Subject<LogoutResponse>();
    logoutSpy.mockReturnValue(pendingRequest);

    facade.logout();
    facade.logout();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(facade.isLoggingOut()).toBe(true);
    expect(sessionClearSpy).not.toHaveBeenCalled();

    pendingRequest.next(validResponse);
    pendingRequest.complete();

    expect(sessionClearSpy).toHaveBeenCalledTimes(1);
    expect(facade.isLoggingOut()).toBe(false);
  });

  it('should clear the local session when the backend logout fails', () => {
    logoutSpy.mockReturnValue(
      throwError(() => new Error('Backend unavailable')),
    );

    facade.logout();

    expect(sessionClearSpy).toHaveBeenCalledTimes(1);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login', {
      replaceUrl: true,
    });
    expect(facade.isLoggingOut()).toBe(false);
  });
});
