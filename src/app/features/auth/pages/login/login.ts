import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { RememberUserModal } from '../../components/remember-user-modal/remember-user-modal';
import { LoginFacade } from '../../services/login.facade';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatDialogModule, RouterLink],
  providers: [LoginFacade],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly dialog = inject(MatDialog);
  private readonly formBuilder = inject(FormBuilder);

  readonly facade = inject(LoginFacade);
  readonly passwordVisible = signal(false);
  readonly loginForm = this.formBuilder.nonNullable.group({
    user: ['', Validators.required],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();

    this.facade.login({
      user: credentials.user.trim(),
      password: credentials.password,
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  openRememberUserModal(): void {
    this.dialog.open(RememberUserModal, {
      width: '640px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      panelClass: 'remember-user-dialog',
      backdropClass: 'remember-user-backdrop',
    });
  }
}
