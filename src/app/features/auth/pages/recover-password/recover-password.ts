import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword {
  private readonly formBuilder = inject(FormBuilder);

  readonly recoverForm = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
  });

  /** Envía la solicitud de recuperación (por ahora solo valida el formulario) */
  recuperar(): void {
    if (this.recoverForm.invalid) {
      this.recoverForm.markAllAsTouched();
      return;
    }

    // Más adelante aquí conectarás el servicio / API
    const { usuario } = this.recoverForm.getRawValue();
    console.log('Recuperar contraseña para:', usuario.trim());
  }
}
