import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DestroyRef,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ACADEMIC_ACCESS_ROLES,
  hasRoleAccess,
  RoleIdentity,
} from '../../../core/config/role-access.config';
import { SessionService } from '../../../core/services/session.service';
import { LoginRequest } from '../models/login-request.model';
import { AuthApiService } from './auth-api.service';

export type LoginMessageType = 'success' | 'error';

export interface LoginFeedback {
  type: LoginMessageType;
  message: string;
}

@Injectable()
export class LoginFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly loadingState = signal(false);
  private readonly feedbackState = signal<LoginFeedback | null>(null);

  readonly isLoading: Signal<boolean> = this.loadingState.asReadonly();
  readonly feedback: Signal<LoginFeedback | null> =
    this.feedbackState.asReadonly();

  constructor() {
    if (this.route.snapshot.queryParamMap.get('reason') === 'unauthorized') {
      this.feedbackState.set({
        type: 'error',
        message: 'Su usuario no tiene permisos para acceder a este módulo.',
      });
    }
  }

  login(credentials: LoginRequest): void {
    if (this.loadingState()) {
      return;
    }

    this.loadingState.set(true);
    this.feedbackState.set(null);

    this.authApi
      .login(credentials)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe({
        next: (response) => {
          const roles: RoleIdentity[] = response.roles.map((role) => ({
            type: role.vrolTipo,
            name: role.vrolNombre,
          }));

          if (!hasRoleAccess(roles, ACADEMIC_ACCESS_ROLES)) {
            this.feedbackState.set({
              type: 'error',
              message: 'Su usuario no tiene permisos para acceder a este módulo.',
            });
            return;
          }

          this.session.start(response.TokenInterno, roles);

          this.feedbackState.set({
            type: 'success',
            message: 'Inicio de sesión exitoso.',
          });

          void this.router.navigateByUrl(this.getDestination());
        },
        error: (error: unknown) => {
          this.feedbackState.set(this.mapError(error));
        },
      });
  }

  private getDestination(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    if (returnUrl === '/photo-upload-home') {
      return returnUrl;
    }

    return '/photo-upload-home';
  }

  private mapError(error: unknown): LoginFeedback {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return {
          type: 'error',
          message: 'Usuario o contraseña incorrectos.',
        };
      }

      if (error.status === 0 || error.status >= 500) {
        return {
          type: 'error',
          message:
            'El servicio no está disponible en este momento. Inténtelo nuevamente.',
        };
      }
    }

    return {
      type: 'error',
      message: 'No fue posible iniciar sesión. Inténtelo nuevamente.',
    };
  }
}
