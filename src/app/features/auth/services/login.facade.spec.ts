import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { SessionService } from '../../../core/services/session.service';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AuthApiService } from './auth-api.service';
import { LoginFacade } from './login.facade';

describe('LoginFacade', () => {
  const credentials: LoginRequest = {
    user: 'usuario-prueba',
    password: 'clave-prueba',
  };
  const validResponse: LoginResponse = {
    codigo: 200,
    mensaje: 'Usuario valido',
    identificacion: '1000000000',
    TokenInterno: 'token-ficticio',
    roles: [
      {
        vrolId: 138,
        vrolNombre: 'Academico_estudiante',
        vrolDescripcion: 'Estudiante académico',
        vrolTipo: 'ESTUDIANTE',
        vrolEstado: '0',
        vrolPublico: '0',
      },
    ],
  };

  let facade: LoginFacade;
  let loginSpy: ReturnType<
    typeof vi.fn<(request: LoginRequest) => Observable<LoginResponse>>
  >;
  let sessionStartSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;
  let returnUrl: string | null;
  let reason: string | null;

  beforeEach(() => {
    loginSpy = vi.fn(() => of(validResponse));
    sessionStartSpy = vi.fn();
    navigateByUrlSpy = vi.fn(() => Promise.resolve(true));
    returnUrl = null;
    reason = null;

    TestBed.configureTestingModule({
      providers: [
        LoginFacade,
        {
          provide: AuthApiService,
          useValue: { login: loginSpy },
        },
        {
          provide: SessionService,
          useValue: { start: sessionStartSpy },
        },
        {
          provide: Router,
          useValue: { navigateByUrl: navigateByUrlSpy },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) =>
                  key === 'returnUrl' ? returnUrl : reason,
              },
            },
          },
        },
      ],
    });

    facade = TestBed.inject(LoginFacade);
  });

  it('should send credentials and navigate after a valid response', () => {
    facade.login(credentials);

    expect(loginSpy).toHaveBeenCalledWith(credentials);
    expect(sessionStartSpy).toHaveBeenCalledWith('token-ficticio', [
      {
        type: 'ESTUDIANTE',
        name: 'Academico_estudiante',
      },
    ]);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/photo-upload-home');
    expect(facade.feedback()).toEqual({
      type: 'success',
      message: 'Inicio de sesión exitoso.',
    });
    expect(facade.isLoading()).toBe(false);
  });

  it('should ignore duplicate requests while loading', () => {
    const pendingRequest = new Subject<LoginResponse>();
    loginSpy.mockReturnValue(pendingRequest);

    facade.login(credentials);
    facade.login(credentials);

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(facade.isLoading()).toBe(true);

    pendingRequest.complete();

    expect(facade.isLoading()).toBe(false);
  });

  it('should show an invalid credentials message for a 401 response', () => {
    loginSpy.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401 })),
    );

    facade.login(credentials);

    expect(facade.feedback()).toEqual({
      type: 'error',
      message: 'Usuario o contraseña incorrectos.',
    });
    expect(sessionStartSpy).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it.each([0, 500, 503])(
    'should show an unavailable service message for status %i',
    (status) => {
      loginSpy.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status })),
      );

      facade.login(credentials);

      expect(facade.feedback()).toEqual({
        type: 'error',
        message:
          'El servicio no está disponible en este momento. Inténtelo nuevamente.',
      });
    },
  );

  it('should show a generic message for an unexpected error', () => {
    loginSpy.mockReturnValue(
      throwError(() => new Error('Unexpected login response')),
    );

    facade.login(credentials);

    expect(facade.feedback()).toEqual({
      type: 'error',
      message: 'No fue posible iniciar sesión. Inténtelo nuevamente.',
    });
    expect(sessionStartSpy).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('should navigate to the protected return URL', () => {
    returnUrl = '/photo-upload-home';

    facade.login(credentials);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/photo-upload-home');
  });

  it('should reject an external return URL', () => {
    returnUrl = '//external.example';

    facade.login(credentials);

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/photo-upload-home');
  });

  it('should allow an academic teacher role', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        roles: [
          {
            vrolId: 200,
            vrolNombre: 'Academico_Docente',
            vrolDescripcion: 'Docente académico',
            vrolTipo: 'DOCENTE',
            vrolEstado: '0',
            vrolPublico: '0',
          },
        ],
      }),
    );

    facade.login(credentials);

    expect(sessionStartSpy).toHaveBeenCalledWith('token-ficticio', [
      { type: 'DOCENTE', name: 'Academico_Docente' },
    ]);
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/photo-upload-home');
  });

  it('should deny a non-academic student role', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        roles: [
          {
            vrolId: 270,
            vrolNombre: 'EstudianteEC',
            vrolDescripcion: 'Educación continuada',
            vrolTipo: 'ESTUDIANTE',
            vrolEstado: '1',
            vrolPublico: '0',
          },
        ],
      }),
    );

    facade.login(credentials);

    expect(sessionStartSpy).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
    expect(facade.feedback()).toEqual({
      type: 'error',
      message: 'Su usuario no tiene permisos para acceder a este módulo.',
    });
  });

  it('should require the role type and name in the same object', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        roles: [
          {
            vrolId: 1,
            vrolNombre: 'OtroRol',
            vrolDescripcion: 'Otro rol estudiantil',
            vrolTipo: 'ESTUDIANTE',
            vrolEstado: '1',
            vrolPublico: '0',
          },
          {
            vrolId: 2,
            vrolNombre: 'Academico_estudiante',
            vrolDescripcion: 'Nombre en otro rol',
            vrolTipo: 'CAP',
            vrolEstado: '1',
            vrolPublico: '0',
          },
        ],
      }),
    );

    facade.login(credentials);

    expect(sessionStartSpy).not.toHaveBeenCalled();
    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });
});
