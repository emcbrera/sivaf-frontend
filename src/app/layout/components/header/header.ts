import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';

import { HeaderUserViewModel } from '../../models/header-user.model';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() isSidebarOpen = true;
  @Input() isLoggingOut = false;
  @Input() user: HeaderUserViewModel | null = null;
  @Output() toggleMenuSidebar = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  readonly isProfileMenuOpen = signal(false);

  get userInitial(): string {
    return this.user?.firstName.trim().charAt(0).toUpperCase() || 'U';
  }

  get userDisplayName(): string {
    if (!this.user) {
      return 'Usuario';
    }

    return this.formatDisplayName(this.user.displayName);
  }

  private formatDisplayName(displayName: string): string {
    return displayName
      .trim()
      .toLocaleLowerCase('es-CO')
      .replace(
        /(^|[\s'-])(\p{L})/gu,
        (match) => match.toLocaleUpperCase('es-CO'),
      );
  }

  onToggleMenuSidebar(): void {
    this.toggleMenuSidebar.emit();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((isOpen) => !isOpen);
  }

  requestLogout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isProfileMenuOpen.set(false);
    this.logoutRequested.emit();
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target;

    if (
      this.isProfileMenuOpen() &&
      target instanceof Node &&
      !this.hostElement.nativeElement.contains(target)
    ) {
      this.isProfileMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeProfileMenuOnEscape(): void {
    this.isProfileMenuOpen.set(false);
  }
}
