import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RememberUserModal } from '../../components/remember-user-modal/remember-user-modal';

type UserRole = 'estudiante' | 'administrador';

interface MockUser {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const MOCK_USERS: MockUser[] = [
  {
    username: 'estudiante',
    password: 'Estudiante123',
    fullName: 'Usuario Estudiante',
    role: 'estudiante',
  },
  {
    username: 'admin',
    password: 'Admin123',
    fullName: 'Usuario Administrador',
    role: 'administrador',
  },
];

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly loginForm;
  loginMessage = '';
  loginMessageType: 'success' | 'error' | '' = '';

  constructor(
    private readonly dialog: MatDialog,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showLoginMessage('Ingrese usuario y contrasena.', 'error');
      return;
    }

    const credentials = this.loginForm.getRawValue();
    const user = MOCK_USERS.find(
      (mockUser) =>
        mockUser.username === credentials.username.trim() &&
        mockUser.password === credentials.password,
    );

    if (!user) {
      this.showLoginMessage('Usuario o contrasena incorrectos.', 'error');
      return;
    }

    localStorage.setItem(
      'sivaf_user',
      JSON.stringify({
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      }),
    );

    this.showLoginMessage(
      `Bienvenido ${user.fullName}. Rol: ${user.role}.`,
      'success',
    );

    if (user.role === 'estudiante') {
      void this.router.navigate(['/photo-upload']);
    }
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

  private showLoginMessage(message: string, type: 'success' | 'error'): void {
    this.loginMessage = message;
    this.loginMessageType = type;
  }
}
