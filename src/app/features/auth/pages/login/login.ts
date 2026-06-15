import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RememberUserModal } from '../../components/remember-user-modal/remember-user-modal';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatDialogModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(private readonly dialog: MatDialog) {}

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
