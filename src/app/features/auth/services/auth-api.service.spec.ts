import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/config/api.config';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  const apiBaseUrl = 'http://api.example.test/api/v1';
  const loginUrl = `${apiBaseUrl}/auth/login/`;
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

  it('should send the login credentials to the configured endpoint', () => {
    service.login(credentials).subscribe();

    const request = httpTesting.expectOne(loginUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush(validResponse);
  });

  it('should return a valid login response', () => {
    let result: LoginResponse | undefined;

    service.login(credentials).subscribe((response) => {
      result = response;
    });

    httpTesting.expectOne(loginUrl).flush(validResponse);

    expect(result).toEqual(validResponse);
  });

  it('should reject an unexpected successful response', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    httpTesting.expectOne(loginUrl).flush({
      codigo: 200,
      mensaje: 'Usuario valido',
      identificacion: '1000000000',
    });

    expect(receivedError).toBeInstanceOf(Error);
  });

  it('should reject a successful response without roles', () => {
    let receivedError: unknown;

    service.login(credentials).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      },
    });

    const { roles: _roles, ...responseWithoutRoles } = validResponse;
    httpTesting.expectOne(loginUrl).flush(responseWithoutRoles);

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
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(receivedStatus).toBe(401);
  });
});
