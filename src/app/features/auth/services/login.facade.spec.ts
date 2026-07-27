import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { SessionService } from '../../../core/services/session.service';
import { AuthRole } from '../models/auth-role.model';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AuthApiService } from './auth-api.service';
import { LoginFacade } from './login.facade';

describe('LoginFacade', () => {
  const credentials: LoginRequest = {
    user: 'usuario-prueba',
    password: 'clave-prueba',
  };
  const academicStudentRole: AuthRole = {
    vrolId: 138,
    vrolNombre: 'Academico_estudiante',
    vrolDescripcion: 'Estudiante académico',
    vrolTipo: 'ESTUDIANTE',
    vrolEstado: '1',
    vrolPublico: '0',
  };
  const validResponse: LoginResponse = {
    codigo: 200,
    mensaje: 'Usuario valido',
    primernombre: 'EIMY',
    segundonombre: 'MARIANA',
    primerapellido: 'CABRERA',
    segundoapellido: 'ZAMORANO',
    email: 'usuario@example.test',
    identificacion: '1000000000',
    TokenInterno: 'token-ficticio',
    roles: [academicStudentRole],
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

  it('should use TokenInterno and the official personal names', () => {
    facade.login(credentials);

    expect(loginSpy).toHaveBeenCalledWith(credentials);
    expect(sessionStartSpy).toHaveBeenCalledWith(
      'token-ficticio',
      [{ type: 'ESTUDIANTE', name: 'Academico_estudiante' }],
      {
        firstName: 'EIMY',
        displayName: 'EIMY MARIANA CABRERA ZAMORANO',
        email: 'usuario@example.test',
      },
    );
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/photo-upload-home');
    expect(facade.isLoading()).toBe(false);
  });

  it('should trim every personal name part', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        primernombre: ' EIMY ',
        segundonombre: ' MARIANA ',
        primerapellido: ' CABRERA ',
        segundoapellido: ' ZAMORANO ',
      }),
    );

    facade.login(credentials);

    expect(sessionStartSpy).toHaveBeenCalledWith(
      'token-ficticio',
      [{ type: 'ESTUDIANTE', name: 'Academico_estudiante' }],
      {
        firstName: 'EIMY',
        displayName: 'EIMY MARIANA CABRERA ZAMORANO',
        email: 'usuario@example.test',
      },
    );
  });

  it('should ignore nullable secondary name parts', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        segundonombre: null,
        segundoapellido: null,
      }),
    );

    facade.login(credentials);

    expect(sessionStartSpy).toHaveBeenCalledWith(
      'token-ficticio',
      [{ type: 'ESTUDIANTE', name: 'Academico_estudiante' }],
      {
        firstName: 'EIMY',
        displayName: 'EIMY CABRERA',
        email: 'usuario@example.test',
      },
    );
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

  it('should allow an academic teacher role', () => {
    const teacherRole: AuthRole = {
      ...academicStudentRole,
      vrolId: 200,
      vrolNombre: 'Academico_Docente',
      vrolDescripcion: 'Docente académico',
      vrolTipo: 'DOCENTE',
    };
    loginSpy.mockReturnValue(of({ ...validResponse, roles: [teacherRole] }));

    facade.login(credentials);

    expect(sessionStartSpy).toHaveBeenCalledWith(
      'token-ficticio',
      [{ type: 'DOCENTE', name: 'Academico_Docente' }],
      expect.objectContaining({
        displayName: 'EIMY MARIANA CABRERA ZAMORANO',
      }),
    );
  });

  it('should deny a non-academic student role', () => {
    loginSpy.mockReturnValue(
      of({
        ...validResponse,
        roles: [
          {
            ...academicStudentRole,
            vrolId: 270,
            vrolNombre: 'EstudianteEC',
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
});
