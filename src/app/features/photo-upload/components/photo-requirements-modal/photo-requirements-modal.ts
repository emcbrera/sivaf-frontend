import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/** Un requisito mostrado en la fila de iconos del modal */
interface RequisitoFoto {
  icono: string;
  texto: string;
}

@Component({
  selector: 'app-photo-requirements-modal',
  imports: [],
  templateUrl: './photo-requirements-modal.html',
  styleUrl: './photo-requirements-modal.css',
})
export class PhotoRequirementsModal {
  /** Criterios clave que se muestran arriba del modal */
  readonly requisitos: RequisitoFoto[] = [
    {
      icono: 'assets/Iconos/fondo_blanco.svg',
      texto: 'Fondo blanco sólido',
    },
    {
      icono: 'assets/Iconos/sin_accesorio.svg',
      texto: 'Sin accesorios',
    },
    {
      icono: 'assets/Iconos/rostro_visible.svg',
      texto: 'Rostro visible',
    },
    {
      icono: 'assets/Iconos/buena_iluminacion.svg',
      texto: 'Buena iluminación',
    },
    {
      icono: 'assets/Iconos/foto_reciente.svg',
      texto: 'Foto reciente',
    },
  ];

  constructor(
    private readonly dialogRef: MatDialogRef<PhotoRequirementsModal>,
  ) {}

  /** Cierra el modal */
  cerrar(): void {
    this.dialogRef.close();
  }
}
