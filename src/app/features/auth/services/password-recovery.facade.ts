import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DestroyRef,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';

import { AuthApiService } from './auth-api.service';

export type PasswordRecoveryMessageType = 'success' | 'error';

export interface PasswordRecoveryFeedback {
  type: PasswordRecoveryMessageType;
  message: string;
}

const SUCCESS_MESSAGE =
  'Se envió un enlace de recuperación de contraseña al correo registrado en Academusoft.';

@Injectable()
export class PasswordRecoveryFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly loadingState = signal(false);
  private readonly feedbackState =
    signal<PasswordRecoveryFeedback | null>(null);

  readonly isLoading: Signal<boolean> = this.loadingState.asReadonly();
  readonly feedback: Signal<PasswordRecoveryFeedback | null> =
    this.feedbackState.asReadonly();

  recoverPassword(username: string): void {
    if (this.loadingState()) {
      return;
    }

    this.feedbackState.set(null);

    const normalizedUsername = username.trim();

    if (normalizedUsername.length === 0) {
      return;
    }

    this.loadingState.set(true);

    this.authApi
      .passwordRecovery({ username: normalizedUsername })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe({
        next: () => {
          this.feedbackState.set({
            type: 'success',
            message: SUCCESS_MESSAGE,
          });
        },
        error: (error: unknown) => {
          this.feedbackState.set(this.mapError(error));
        },
      });
  }

  private mapError(error: unknown): PasswordRecoveryFeedback {
    if (
      error instanceof HttpErrorResponse &&
      (error.status === 0 || error.status >= 500)
    ) {
      return {
        type: 'error',
        message:
          'El servicio no está disponible en este momento. Inténtelo nuevamente.',
      };
    }

    return {
      type: 'error',
      message: 'No fue posible procesar la solicitud. Inténtelo nuevamente.',
    };
  }
}
