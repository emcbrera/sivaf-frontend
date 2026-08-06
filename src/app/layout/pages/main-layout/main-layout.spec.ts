import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { SessionUserProfile } from '../../../core/models/session-user-profile.model';
import { SessionService } from '../../../core/services/session.service';
import { LogoutFacade } from '../../../features/auth/services/logout.facade';
import { Header } from '../../components/header/header';
import { MainLayout } from './main-layout';

describe('MainLayout', () => {
  const profileState = signal<SessionUserProfile | null>(null);
  const loggingOutState = signal(false);

  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;
  let logoutSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    profileState.set(null);
    loggingOutState.set(false);
    logoutSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        {
          provide: SessionService,
          useValue: {
            userProfile: profileState.asReadonly(),
          },
        },
        {
          provide: LogoutFacade,
          useValue: {
            isLoggingOut: loggingOutState.asReadonly(),
            logout: logoutSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide the session profile to the header', () => {
    const profile: SessionUserProfile = {
      firstName: 'EIMY',
      displayName: 'EIMY MARIANA CABRERA ZAMORANO',
      email: 'usuario@example.test',
    };
    profileState.set(profile);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(Header))
      .componentInstance as Header;

    expect(component.headerUser()).toEqual(profile);
    expect(header.user).toEqual(profile);
  });

  it('should delegate the header logout request to the facade', () => {
    const header = fixture.debugElement.query(By.directive(Header))
      .componentInstance as Header;

    header.logoutRequested.emit();

    expect(logoutSpy).toHaveBeenCalledOnce();
  });

  it('should provide the logout loading state to the header', () => {
    loggingOutState.set(true);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(Header))
      .componentInstance as Header;

    expect(component.isLoggingOut()).toBe(true);
    expect(header.isLoggingOut).toBe(true);
  });
});
