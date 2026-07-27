import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-photo-requirements-modal',
  imports: [],
  templateUrl: './photo-requirements-modal.html',
  styleUrl: './photo-requirements-modal.css',
})
export class PhotoRequirementsModal {
  constructor(
    private readonly dialogRef: MatDialogRef<PhotoRequirementsModal>,
  ) {}

  /** Cierra el modal */
  cerrar(): void {
    this.dialogRef.close();
  }
}
