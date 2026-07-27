import { computed, Injectable, signal } from '@angular/core';

import {
  hasRoleAccess,
  RoleIdentity,
} from '../config/role-access.config';

const SESSION_STORAGE_KEY = 'sivaf.auth.session';
const LEGACY_TOKEN_STORAGE_KEY = 'sivaf.auth.token';

interface StoredSession {
  token: string;
  roles: RoleIdentity[];
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly sessionState = signal<StoredSession | null>(
    this.readStoredSession(),
  );

  readonly token = computed(() => this.sessionState()?.token ?? null);
  readonly roles = computed<readonly RoleIdentity[]>(
    () => this.sessionState()?.roles ?? [],
  );
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  start(token: string, roles: readonly RoleIdentity[]): void {
    if (token.trim().length === 0) {
      throw new Error('Cannot start a session without a token');
    }

    const session: StoredSession = {
      token,
      roles: roles.map((role) => ({ ...role })),
    };

    this.sessionState.set(session);
    this.storeSession(session);
  }

  hasAnyRole(requiredRoles: readonly RoleIdentity[]): boolean {
    return hasRoleAccess(this.roles(), requiredRoles);
  }

  clear(): void {
    this.sessionState.set(null);
    this.removeStoredSession();
  }

  private readStoredSession(): StoredSession | null {
    try {
      globalThis.sessionStorage?.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      const serializedSession =
        globalThis.sessionStorage?.getItem(SESSION_STORAGE_KEY);

      if (!serializedSession) {
        return null;
      }

      const storedValue: unknown = JSON.parse(serializedSession);

      if (!this.isStoredSession(storedValue)) {
        globalThis.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return storedValue;
    } catch {
      return null;
    }
  }

  private storeSession(session: StoredSession): void {
    try {
      globalThis.sessionStorage?.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(session),
      );
    } catch {
      // The session remains available in memory for this application run.
    }
  }

  private removeStoredSession(): void {
    try {
      globalThis.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
      globalThis.sessionStorage?.removeItem(LEGACY_TOKEN_STORAGE_KEY);
    } catch {
      // The in-memory session has already been cleared.
    }
  }

  private isStoredSession(value: unknown): value is StoredSession {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate['token'] === 'string' &&
      candidate['token'].trim().length > 0 &&
      Array.isArray(candidate['roles']) &&
      candidate['roles'].every((role: unknown) => this.isRoleIdentity(role))
    );
  }

  private isRoleIdentity(value: unknown): value is RoleIdentity {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
      typeof candidate['type'] === 'string' &&
      candidate['type'].length > 0 &&
      typeof candidate['name'] === 'string' &&
      candidate['name'].length > 0
    );
  }
}
