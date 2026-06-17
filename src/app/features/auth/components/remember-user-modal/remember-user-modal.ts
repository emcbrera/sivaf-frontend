import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-remember-user-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './remember-user-modal.html',
  styleUrl: './remember-user-modal.css',
})
export class RememberUserModal {
  readonly rememberUserForm;
  resultMessage = '';

  constructor(
    private readonly dialogRef: MatDialogRef<RememberUserModal>,
    private readonly formBuilder: FormBuilder,
  ) {
    this.rememberUserForm = this.formBuilder.nonNullable.group({
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  consultUser(): void {
    if (this.rememberUserForm.invalid) {
      this.rememberUserForm.markAllAsTouched();
      return;
    }

    this.resultMessage = 'Eimy Mariana Cabrera Zamorano, su usuario academusoft es "emcabrera"';
  }
}
