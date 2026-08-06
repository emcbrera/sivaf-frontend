import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

export interface PasswordRecoverySuccessModalData {
  message: string;
}

@Component({
  selector: 'app-password-recovery-success-modal',
  imports: [],
  templateUrl: './password-recovery-success-modal.html',
  styleUrl: './password-recovery-success-modal.css',
})
export class PasswordRecoverySuccessModal {
  private readonly dialogRef = inject(
    MatDialogRef<PasswordRecoverySuccessModal, boolean>,
  );

  readonly data = inject<PasswordRecoverySuccessModalData>(
    MAT_DIALOG_DATA,
  );

  confirm(): void {
    this.dialogRef.close(true);
  }
}
