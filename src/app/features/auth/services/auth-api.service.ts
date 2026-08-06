import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL, AUTH_API_PATHS } from '../../../core/config/api.config';
import { AuthRole } from '../models/auth-role.model';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { LogoutResponse } from '../models/logout-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<unknown>(
        `${this.apiBaseUrl}${AUTH_API_PATHS.login}`,
        credentials,
      )
      .pipe(map((response) => this.validateLoginResponse(response)));
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<unknown>(`${this.apiBaseUrl}${AUTH_API_PATHS.logout}`, null)
      .pipe(map((response) => this.validateLogoutResponse(response)));
  }

  private validateLogoutResponse(response: unknown): LogoutResponse {
    if (!this.isLogoutResponse(response)) {
      throw new Error('Unexpected logout response');
    }

    return response;
  }

  private isLogoutResponse(response: unknown): response is LogoutResponse {
    if (
      typeof response !== 'object' ||
      response === null ||
      Array.isArray(response)
    ) {
      return false;
    }

    const candidate = response as Record<string, unknown>;

    return (
      typeof candidate['detail'] === 'string' &&
      candidate['detail'].trim().length > 0
    );
  }

  private validateLoginResponse(response: unknown): LoginResponse {
    if (!this.isLoginResponse(response)) {
      throw new Error('Unexpected login response');
    }

    return response;
  }

  private isLoginResponse(response: unknown): response is LoginResponse {
    if (
      typeof response !== 'object' ||
      response === null ||
      Array.isArray(response)
    ) {
      return false;
    }

    const candidate = response as Record<string, unknown>;

    return (
      candidate['codigo'] === 200 &&
      typeof candidate['mensaje'] === 'string' &&
      typeof candidate['primernombre'] === 'string' &&
      candidate['primernombre'].trim().length > 0 &&
      this.isNullableString(candidate['segundonombre']) &&
      typeof candidate['primerapellido'] === 'string' &&
      candidate['primerapellido'].trim().length > 0 &&
      this.isNullableString(candidate['segundoapellido']) &&
      typeof candidate['email'] === 'string' &&
      typeof candidate['identificacion'] === 'string' &&
      candidate['identificacion'].length > 0 &&
      typeof candidate['TokenInterno'] === 'string' &&
      candidate['TokenInterno'].length > 0 &&
      Array.isArray(candidate['roles']) &&
      candidate['roles'].every((role: unknown) => this.isAuthRole(role))
    );
  }

  private isNullableString(value: unknown): boolean {
    return value === null || typeof value === 'string';
  }

  private isAuthRole(value: unknown): value is AuthRole {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate['vrolId'] === 'number' &&
      typeof candidate['vrolNombre'] === 'string' &&
      typeof candidate['vrolDescripcion'] === 'string' &&
      typeof candidate['vrolTipo'] === 'string' &&
      typeof candidate['vrolEstado'] === 'string' &&
      typeof candidate['vrolPublico'] === 'string'
    );
  }
}
