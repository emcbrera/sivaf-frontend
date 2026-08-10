import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PhotoRequirementsModal } from '../../components/photo-requirements-modal/photo-requirements-modal';

@Component({
  selector: 'app-photo-upload-home',
  imports: [MatDialogModule],
  templateUrl: './photo-upload-home.html',
  styleUrl: './photo-upload-home.css',
})
export class PhotoUploadHome {
  constructor(private readonly dialog: MatDialog) {}

  /** Abre el modal de galería de ejemplos / requisitos de foto */
  abrirModalEjemplos(): void {
    this.dialog.open(PhotoRequirementsModal, {
      width: '960px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      panelClass: 'photo-requirements-dialog',
    });
  }
}
