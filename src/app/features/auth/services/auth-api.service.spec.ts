import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/config/api.config';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { LogoutResponse } from '../models/logout-response.model';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  const apiBaseUrl = 'http://api.example.test/api/v1';
  const loginUrl = `${apiBaseUrl}/auth/login/`;
  const logoutUrl = `${apiBaseUrl}/auth/logout/`;
  const credentials: LoginRequest = {
    user: 'usuario-prueba',
    password: 'clave-prueba',
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
    roles: [
      {
        vrolId: 138,
        vrolNombre: 'Academico_estudiante',
        vrolDescripcion: 'Estudiante académico',
        vrolTipo: 'ESTUDIANTE',
        vrolEstado: '1',
        vrolPublico: '0',
      },
    ],
  };

  let service: AuthApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: apiBaseUrl,
        },
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should send credentials to the configured login endpoint', () => {
    service.login(credentials).subscribe();

    const request = httpTesting.expectOne(loginUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(validResponse);
  });

  it('should accept the official flat response with personal names', () => {
    let result: LoginResponse | undefined;

    service.login(credentials).subscribe((response) => {
      result = response;
    });

    httpTesting.expectOne(loginUrl).flush(validResponse);

    expect(result).toEqual(validResponse);
  });

  it('should accept nullable secondary names', () => {
    let result: LoginResponse | undefined;
    const responseWithNames: LoginResponse = {
      ...validResponse,
      segundonombre: null,
      segundoapellido: null,
    };

    service.login(credentials).subscribe((response) => {
      result = response;
    });

    httpTesting.expectOne(loginUrl).flush(responseWithNames);

    expect(result).toEqual(responseWithNames);
  });

  it('should reject the incorrect nested response contract', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush({
      codigo: 200,
      mensaje: 'Usuario valido',
      valor: {},
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should reject an empty internal token', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush({
      ...validResponse,
      TokenInterno: '',
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should reject a secondary name with an unexpected type', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush({
      ...validResponse,
      segundonombre: 123,
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should reject a response without the required first name', () => {
    let receivedError: unknown;
    const { primernombre: _firstName, ...responseWithoutFirstName } =
      validResponse;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush(responseWithoutFirstName);

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should reject a malformed role', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush({
      ...validResponse,
      roles: [{ vrolTipo: 'ESTUDIANTE' }],
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should propagate an unauthorized response', () => {
    let receivedStatus: number | undefined;

    service.login(credentials).subscribe({
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      },
    });

    httpTesting.expectOne(loginUrl).flush(
      { detail: 'Credenciales inválidas.' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(receivedStatus).toBe(401);
  });

  it('should send a null body to the configured logout endpoint', () => {
    service.logout().subscribe();

    const request = httpTesting.expectOne(logoutUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({ detail: 'Sesión cerrada correctamente.' });
  });

  it('should accept the official logout response', () => {
    const validLogoutResponse: LogoutResponse = {
      detail: 'Sesión cerrada correctamente.',
    };
    let result: LogoutResponse | undefined;

    service.logout().subscribe((response) => {
      result = response;
    });

    httpTesting.expectOne(logoutUrl).flush(validLogoutResponse);

    expect(result).toEqual(validLogoutResponse);
  });

  it('should reject a malformed logout response', () => {
    let receivedError: unknown;

    service.logout().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(logoutUrl).flush({ detail: '' });

    expect(receivedError).toBeInstanceOf(Error);
  });
});
