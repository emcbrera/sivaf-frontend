import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { PasswordRecoverySuccessModal } from '../../components/password-recovery-success-modal/password-recovery-success-modal';
import {
  PasswordRecoveryFacade,
  PasswordRecoveryFeedback,
} from '../../services/password-recovery.facade';
import { RecoverPassword } from './recover-password';

describe('RecoverPassword', () => {
  let component: RecoverPassword;
  let fixture: ComponentFixture<RecoverPassword>;
  let recoverPasswordSpy: ReturnType<typeof vi.fn>;
  let dialogOpenSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;
  let dialogClosed: Subject<boolean | undefined>;
  const loadingState = signal(false);
  const feedbackState = signal<PasswordRecoveryFeedback | null>(null);

  beforeEach(async () => {
    loadingState.set(false);
    feedbackState.set(null);
    recoverPasswordSpy = vi.fn();
    dialogClosed = new Subject<boolean | undefined>();
    dialogOpenSpy = vi.fn(() => ({
      afterClosed: () => dialogClosed.asObservable(),
    }));

    await TestBed.configureTestingModule({
      imports: [RecoverPassword],
      providers: [
        provideRouter([]),
        {
          provide: MatDialog,
          useValue: { open: dialogOpenSpy },
        },
      ],
    })
      .overrideComponent(RecoverPassword, {
        set: {
          providers: [
            {
              provide: MatDialog,
              useValue: { open: dialogOpenSpy },
            },
            {
              provide: PasswordRecoveryFacade,
              useValue: {
                isLoading: loadingState.asReadonly(),
                feedback: feedbackState.asReadonly(),
                recoverPassword: recoverPasswordSpy,
              },
            },
          ],
        },
      })
      .compileComponents();

    navigateByUrlSpy = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);

    fixture = TestBed.createComponent(RecoverPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the username as touched without submitting an empty form', () => {
    component.recuperar();

    expect(component.recoverForm.controls.usuario.touched).toBe(true);
    expect(recoverPasswordSpy).not.toHaveBeenCalled();
  });

  it('should delegate a valid username to the facade', () => {
    component.recoverForm.controls.usuario.setValue('usuario-prueba');

    component.recuperar();

    expect(recoverPasswordSpy).toHaveBeenCalledWith('usuario-prueba');
  });

  it('should disable the form submission while loading', () => {
    loadingState.set(true);
    fixture.detectChanges();

    const usernameInput = fixture.nativeElement.querySelector(
      '#usuario',
    ) as HTMLInputElement;
    const submitButton = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(usernameInput.readOnly).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.getAttribute('aria-busy')).toBe('true');
    expect(submitButton.textContent).toContain('Enviando...');
  });

  it('should render error feedback without opening the modal', () => {
    const message = 'No fue posible procesar la solicitud.';
    feedbackState.set({ type: 'error', message });
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector(
      '.request-feedback',
    ) as HTMLParagraphElement;

    expect(feedback.textContent).toContain(message);
    expect(feedback.getAttribute('role')).toBe('alert');
    expect(feedback.classList).toContain('request-feedback--error');
    expect(dialogOpenSpy).not.toHaveBeenCalled();
  });

  it('should open one non-dismissible modal for successful feedback', () => {
    const message = 'Solicitud procesada.';
    feedbackState.set({ type: 'success', message });

    fixture.detectChanges();
    fixture.detectChanges();

    expect(dialogOpenSpy).toHaveBeenCalledOnce();
    expect(dialogOpenSpy).toHaveBeenCalledWith(
      PasswordRecoverySuccessModal,
      expect.objectContaining({
        data: { message },
        disableClose: true,
        autoFocus: 'button',
        restoreFocus: true,
      }),
    );
    expect(
      fixture.nativeElement.querySelector('.request-feedback'),
    ).toBeNull();
  });

  it('should replace the current URL with login after confirmation', () => {
    feedbackState.set({
      type: 'success',
      message: 'Solicitud procesada.',
    });
    fixture.detectChanges();

    dialogClosed.next(true);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login', {
      replaceUrl: true,
    });
  });
});
