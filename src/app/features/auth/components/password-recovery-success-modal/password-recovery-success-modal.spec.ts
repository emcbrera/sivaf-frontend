import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';

import { PasswordRecoverySuccessModal } from './password-recovery-success-modal';

describe('PasswordRecoverySuccessModal', () => {
  const message =
    'Se envió un enlace de recuperación de contraseña al correo registrado en Academusoft.';

  let fixture: ComponentFixture<PasswordRecoverySuccessModal>;
  let closeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    closeSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [PasswordRecoverySuccessModal],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { message },
        },
        {
          provide: MatDialogRef,
          useValue: { close: closeSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoverySuccessModal);
    await fixture.whenStable();
  });

  it('should render the recovery confirmation message', () => {
    expect(fixture.nativeElement.textContent).toContain(message);
  });

  it('should close with confirmation after clicking Accept', () => {
    const confirmButton = fixture.nativeElement.querySelector(
      '.success-modal__button',
    ) as HTMLButtonElement;

    confirmButton.click();

    expect(closeSpy).toHaveBeenCalledWith(true);
  });
});
