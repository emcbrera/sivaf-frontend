import { TestBed } from '@angular/core/testing';

import { ACADEMIC_ACCESS_ROLES } from '../config/role-access.config';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const storageKey = 'sivaf.auth.session';
  const legacyStorageKey = 'sivaf.auth.token';
  const fakeToken = 'token-ficticio';
  const academicStudentRole = {
    type: 'ESTUDIANTE',
    name: 'Academico_estudiante',
  };

  beforeEach(() => {
    globalThis.sessionStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    globalThis.sessionStorage.clear();
  });

  it('should start without an authenticated session', () => {
    const service = TestBed.inject(SessionService);

    expect(service.token()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should keep the minimal session in memory and session storage', () => {
    const service = TestBed.inject(SessionService);

    service.start(fakeToken, [academicStudentRole]);

    expect(service.token()).toBe(fakeToken);
    expect(service.roles()).toEqual([academicStudentRole]);
    expect(service.isAuthenticated()).toBe(true);
    expect(JSON.parse(globalThis.sessionStorage.getItem(storageKey) ?? '')).toEqual({
      token: fakeToken,
      roles: [academicStudentRole],
    });
  });

  it('should restore a valid stored session', () => {
    globalThis.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ token: fakeToken, roles: [academicStudentRole] }),
    );

    const service = TestBed.inject(SessionService);

    expect(service.token()).toBe(fakeToken);
    expect(service.roles()).toEqual([academicStudentRole]);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject malformed stored session data', () => {
    globalThis.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ token: fakeToken, roles: [{ type: 'ESTUDIANTE' }] }),
    );

    const service = TestBed.inject(SessionService);

    expect(service.isAuthenticated()).toBe(false);
    expect(globalThis.sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('should remove a legacy token-only session', () => {
    globalThis.sessionStorage.setItem(legacyStorageKey, fakeToken);

    const service = TestBed.inject(SessionService);

    expect(service.isAuthenticated()).toBe(false);
    expect(globalThis.sessionStorage.getItem(legacyStorageKey)).toBeNull();
  });

  it('should verify exact role type and name pairs', () => {
    const service = TestBed.inject(SessionService);
    service.start(fakeToken, [academicStudentRole]);

    expect(service.hasAnyRole(ACADEMIC_ACCESS_ROLES)).toBe(true);
    expect(
      service.hasAnyRole([
        { type: 'ESTUDIANTE', name: 'EstudianteEC' },
      ]),
    ).toBe(false);
  });

  it('should clear the session from memory and storage', () => {
    const service = TestBed.inject(SessionService);
    service.start(fakeToken, [academicStudentRole]);

    service.clear();

    expect(service.token()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.isAuthenticated()).toBe(false);
    expect(globalThis.sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('should reject an empty token', () => {
    const service = TestBed.inject(SessionService);

    expect(() => service.start('   ', [academicStudentRole])).toThrowError(
      'Cannot start a session without a token',
    );
    expect(service.isAuthenticated()).toBe(false);
  });
});
