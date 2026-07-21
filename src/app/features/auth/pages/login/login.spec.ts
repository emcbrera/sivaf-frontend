import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  LoginFacade,
  LoginFeedback,
} from '../../services/login.facade';
import { Login } from './login';

describe('Login', () => {
  const loadingState = signal(false);
  const feedbackState = signal<LoginFeedback | null>(null);
  const loginSpy = vi.fn();
  const facadeMock = {
    isLoading: loadingState.asReadonly(),
    feedback: feedbackState.asReadonly(),
    login: loginSpy,
  };

  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    loadingState.set(false);
    feedbackState.set(null);
    loginSpy.mockReset();

    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    });
    TestBed.overrideComponent(Login, {
      set: {
        providers: [
          {
            provide: LoginFacade,
            useValue: facadeMock,
          },
        ],
      },
    });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark an empty form as touched without calling the facade', () => {
    component.login();

    expect(component.loginForm.controls.user.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);
    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('should trim the user but preserve the password', () => {
    component.loginForm.setValue({
      user: '  usuario-real  ',
      password: ' clave con espacios ',
    });

    component.login();

    expect(loginSpy).toHaveBeenCalledWith({
      user: 'usuario-real',
      password: ' clave con espacios ',
    });
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible()).toBe(false);

    component.togglePasswordVisibility();

    expect(component.passwordVisible()).toBe(true);
  });

  it('should disable the submit button while loading', () => {
    loadingState.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Iniciando sesión...');
  });

  it('should display feedback from the facade', () => {
    feedbackState.set({
      type: 'error',
      message: 'Mensaje controlado.',
    });
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector(
      '.login-message',
    ) as HTMLElement;

    expect(message.textContent).toContain('Mensaje controlado.');
    expect(message.classList.contains('login-message--error')).toBe(true);
  });
});
