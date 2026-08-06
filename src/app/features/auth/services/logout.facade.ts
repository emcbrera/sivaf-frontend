import { inject, Injectable, Signal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs';

import { SessionService } from '../../../core/services/session.service';
import { AuthApiService } from './auth-api.service';

@Injectable({
  providedIn: 'root',
})
export class LogoutFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  private readonly loggingOutState = signal(false);

  readonly isLoggingOut: Signal<boolean> =
    this.loggingOutState.asReadonly();

  logout(): void {
    if (this.loggingOutState()) {
      return;
    }

    this.loggingOutState.set(true);

    this.authApi
      .logout()
      .pipe(
        take(1),
        finalize(() => this.finishLogout()),
      )
      .subscribe({
        error: () => undefined,
      });
  }

  private finishLogout(): void {
    this.session.clear();
    this.loggingOutState.set(false);

    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
