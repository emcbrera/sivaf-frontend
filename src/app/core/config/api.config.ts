import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const AUTH_API_PATHS = {
  login: '/auth/login/',
  logout: '/auth/logout/',
  passwordRecovery: '/auth/password-recovery/',
} as const;

export const PUBLIC_AUTH_API_PATHS = [
  AUTH_API_PATHS.login,
  AUTH_API_PATHS.passwordRecovery,
] as const;
