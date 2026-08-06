import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { LogoutFacade } from '../../../features/auth/services/logout.facade';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { HeaderUserViewModel } from '../../models/header-user.model';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private readonly session = inject(SessionService);
  private readonly logoutFacade = inject(LogoutFacade);

  isSidebarOpen = true;
  readonly isLoggingOut = this.logoutFacade.isLoggingOut;
  readonly headerUser = computed<HeaderUserViewModel | null>(() => {
    const profile = this.session.userProfile();

    return profile ? { ...profile } : null;
  });

  onToggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLogoutRequested(): void {
    this.logoutFacade.logout();
  }
}
