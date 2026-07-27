import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create with a neutral user initial', () => {
    expect(component).toBeTruthy();
    expect(component.userInitial).toBe('U');
    expect(component.userDisplayName).toBe('Usuario');
  });

  it('should render the supplied user information', () => {
    component.user = {
      firstName: 'Eimy',
      displayName: 'Eimy Mariana Cabrera Zamorano',
      email: 'usuario@example.test',
    };
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '.profile-trigger',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector(
      '.profile-menu',
    ) as HTMLElement;

    expect(trigger.textContent?.trim()).toBe('E');
    expect(menu.textContent).toContain('Eimy Mariana Cabrera Zamorano');
    expect(menu.textContent).toContain('usuario@example.test');
  });

  it('should format compound names with only their initials uppercase', () => {
    component.user = {
      firstName: 'MARÍA-JOSÉ',
      displayName: "MARÍA-JOSÉ O'CONNOR",
      email: 'usuario@example.test',
    };

    expect(component.userInitial).toBe('M');
    expect(component.userDisplayName).toBe("María-José O'Connor");
  });

  it('should toggle the profile menu and aria-expanded state', () => {
    const trigger = fixture.nativeElement.querySelector(
      '.profile-trigger',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    fixture.detectChanges();

    expect(component.isProfileMenuOpen()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.profile-menu')).toBeTruthy();

    trigger.click();
    fixture.detectChanges();

    expect(component.isProfileMenuOpen()).toBe(false);
  });

  it('should close the profile menu with Escape', () => {
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isProfileMenuOpen()).toBe(false);
  });

  it('should close the profile menu after an outside click', () => {
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(component.isProfileMenuOpen()).toBe(false);
  });

  it('should emit a logout request and close the menu', () => {
    const logoutSpy = vi.fn();
    component.logoutRequested.subscribe(logoutSpy);
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector(
      '.profile-menu__logout',
    ) as HTMLButtonElement;
    logoutButton.click();

    expect(logoutSpy).toHaveBeenCalledOnce();
    expect(component.isProfileMenuOpen()).toBe(false);
  });

  it('should disable logout and avoid duplicate requests while processing', () => {
    const logoutSpy = vi.fn();
    component.logoutRequested.subscribe(logoutSpy);
    component.isLoggingOut = true;
    component.isProfileMenuOpen.set(true);
    fixture.detectChanges();

    const logoutButton = fixture.nativeElement.querySelector(
      '.profile-menu__logout',
    ) as HTMLButtonElement;

    expect(logoutButton.disabled).toBe(true);
    expect(logoutButton.getAttribute('aria-busy')).toBe('true');
    expect(logoutButton.textContent).toContain('Cerrando sesión...');

    component.requestLogout();

    expect(logoutSpy).not.toHaveBeenCalled();
  });
});
