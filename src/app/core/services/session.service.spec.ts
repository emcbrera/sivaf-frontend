import { TestBed } from '@angular/core/testing';

import { ACADEMIC_ACCESS_ROLES } from '../config/role-access.config';
import { SessionUserProfile } from '../models/session-user-profile.model';
import { SessionService } from './session.service';

describe('SessionService', () => {
  const storageKey = 'sivaf.auth.session';
  const legacyStorageKey = 'sivaf.auth.token';
  const fakeToken = 'token-ficticio';
  const academicStudentRole = {
    type: 'ESTUDIANTE',
    name: 'Academico_estudiante',
  };
  const userProfile: SessionUserProfile = {
    firstName: 'EIMY',
    displayName: 'EIMY MARIANA CABRERA ZAMORANO',
    email: 'usuario@example.test',
  };
  const storedSession = {
    token: fakeToken,
    roles: [academicStudentRole],
    userProfile,
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
    expect(service.userProfile()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should persist only token, roles and the minimal user profile', () => {
    const service = TestBed.inject(SessionService);

    service.start(fakeToken, [academicStudentRole], userProfile);

    expect(service.token()).toBe(fakeToken);
    expect(service.roles()).toEqual([academicStudentRole]);
    expect(service.userProfile()).toEqual(userProfile);
    expect(service.isAuthenticated()).toBe(true);
    expect(
      JSON.parse(globalThis.sessionStorage.getItem(storageKey) ?? ''),
    ).toEqual(storedSession);
  });

  it('should restore a valid session with its user profile', () => {
    globalThis.sessionStorage.setItem(
      storageKey,
      JSON.stringify(storedSession),
    );

    const service = TestBed.inject(SessionService);

    expect(service.token()).toBe(fakeToken);
    expect(service.roles()).toEqual([academicStudentRole]);
    expect(service.userProfile()).toEqual(userProfile);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should reject a previous session without a user profile', () => {
    globalThis.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ token: fakeToken, roles: [academicStudentRole] }),
    );

    const service = TestBed.inject(SessionService);

    expect(service.isAuthenticated()).toBe(false);
    expect(globalThis.sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('should reject a malformed stored user profile', () => {
    globalThis.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ...storedSession,
        userProfile: { firstName: 'EIMY', email: 'usuario@example.test' },
      }),
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
    service.start(fakeToken, [academicStudentRole], userProfile);

    expect(service.hasAnyRole(ACADEMIC_ACCESS_ROLES)).toBe(true);
    expect(
      service.hasAnyRole([
        { type: 'ESTUDIANTE', name: 'EstudianteEC' },
      ]),
    ).toBe(false);
  });

  it('should clear token, roles and user profile', () => {
    const service = TestBed.inject(SessionService);
    service.start(fakeToken, [academicStudentRole], userProfile);

    service.clear();

    expect(service.token()).toBeNull();
    expect(service.roles()).toEqual([]);
    expect(service.userProfile()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(globalThis.sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('should reject an empty token', () => {
    const service = TestBed.inject(SessionService);

    expect(() =>
      service.start('   ', [academicStudentRole], userProfile),
    ).toThrowError('Cannot start a session without a token');
    expect(service.isAuthenticated()).toBe(false);
  });
});
