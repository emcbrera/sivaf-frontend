import {
  Component,
  DestroyRef,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { PasswordRecoverySuccessModal } from '../../components/password-recovery-success-modal/password-recovery-success-modal';
import { PasswordRecoveryFacade } from '../../services/password-recovery.facade';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, MatDialogModule, RouterLink],
  providers: [PasswordRecoveryFacade],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);
  private readonly passwordRecoveryFacade = inject(
    PasswordRecoveryFacade,
  );
  private readonly router = inject(Router);
  private successDialogOpen = false;

  readonly isLoading = this.passwordRecoveryFacade.isLoading;
  readonly feedback = this.passwordRecoveryFacade.feedback;

  readonly recoverForm = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const currentFeedback = this.feedback();

      if (
        currentFeedback?.type === 'success' &&
        !this.successDialogOpen
      ) {
        this.openSuccessDialog(currentFeedback.message);
      }
    });
  }

  recuperar(): void {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    this.passwordRecoveryFacade.recoverPassword(
      this.recoverForm.controls.usuario.value,
    );
  }

  private openSuccessDialog(message: string): void {
    this.successDialogOpen = true;

    this.dialog
      .open(PasswordRecoverySuccessModal, {
        width: '480px',
        maxWidth: 'calc(100vw - 32px)',
        data: { message },
        disableClose: true,
        autoFocus: 'button',
        restoreFocus: true,
        ariaLabelledBy: 'passwordRecoverySuccessTitle',
        ariaDescribedBy: 'passwordRecoverySuccessDescription',
      })
      .afterClosed()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          void this.router.navigateByUrl('/login', {
            replaceUrl: true,
          });
        }
      });
  }
}
