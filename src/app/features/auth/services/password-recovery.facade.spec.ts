import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';

import { PasswordRecoveryRequest } from '../models/password-recovery-request.model';
import { PasswordRecoveryResponse } from '../models/password-recovery-response.model';
import { AuthApiService } from './auth-api.service';
import { PasswordRecoveryFacade } from './password-recovery.facade';

describe('PasswordRecoveryFacade', () => {
  const backendResponse: PasswordRecoveryResponse = {
    codigo: 200,
    mensaje:
      'Si el usuario existe, se enviarán las instrucciones de recuperación.',
  };
  const publicSuccessMessage =
    'Se envió un enlace de recuperación de contraseña al correo registrado en Academusoft.';

  let facade: PasswordRecoveryFacade;
  let passwordRecoverySpy: ReturnType<
    typeof vi.fn<
      (request: PasswordRecoveryRequest) =>
        Observable<PasswordRecoveryResponse>
    >
  >;

  beforeEach(() => {
    passwordRecoverySpy = vi.fn(() => of(backendResponse));

    TestBed.configureTestingModule({
      providers: [
        PasswordRecoveryFacade,
        {
          provide: AuthApiService,
          useValue: { passwordRecovery: passwordRecoverySpy },
        },
      ],
    });

    facade = TestBed.inject(PasswordRecoveryFacade);
  });

  it('should normalize the username before sending the request', () => {
    facade.recoverPassword('  usuario-prueba  ');

    expect(passwordRecoverySpy).toHaveBeenCalledWith({
      username: 'usuario-prueba',
    });
  });

  it('should show the fixed public message after a successful request', () => {
    facade.recoverPassword('usuario-prueba');

    expect(facade.feedback()).toEqual({
      type: 'success',
      message: publicSuccessMessage,
    });
    expect(facade.feedback()?.message).not.toBe(backendResponse.mensaje);
    expect(facade.isLoading()).toBe(false);
  });

  it('should not send an empty username', () => {
    facade.recoverPassword('   ');

    expect(passwordRecoverySpy).not.toHaveBeenCalled();
    expect(facade.feedback()).toBeNull();
    expect(facade.isLoading()).toBe(false);
  });

  it('should ignore duplicate requests while loading', () => {
    const pendingRequest = new Subject<PasswordRecoveryResponse>();
    passwordRecoverySpy.mockReturnValue(pendingRequest);

    facade.recoverPassword('usuario-prueba');
    facade.recoverPassword('otro-usuario');

    expect(passwordRecoverySpy).toHaveBeenCalledTimes(1);
    expect(facade.isLoading()).toBe(true);

    pendingRequest.next(backendResponse);
    pendingRequest.complete();

    expect(facade.isLoading()).toBe(false);
  });

  it.each([0, 500, 503])(
    'should show an unavailable service message for status %i',
    (status) => {
      passwordRecoverySpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status })),
      );

      facade.recoverPassword('usuario-prueba');

      expect(facade.feedback()).toEqual({
        type: 'error',
        message:
          'El servicio no está disponible en este momento. Inténtelo nuevamente.',
      });
      expect(facade.isLoading()).toBe(false);
    },
  );

  it('should show a generic message for an unexpected error', () => {
    passwordRecoverySpy.mockReturnValue(
      throwError(() => new Error('Unexpected response')),
    );

    facade.recoverPassword('usuario-prueba');

    expect(facade.feedback()).toEqual({
      type: 'error',
      message: 'No fue posible procesar la solicitud. Inténtelo nuevamente.',
    });
    expect(facade.isLoading()).toBe(false);
  });
});
