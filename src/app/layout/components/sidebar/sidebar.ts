import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarItem, UserRole } from '../../models/sidebar-item.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  currentRole: UserRole = 'ESTUDIANTE';

  menuItems: SidebarItem[] = [
    {
      label: 'Home',
      route: '/photo-upload',
      icon: 'assets/icons/home.png',
      roles: ['ESTUDIANTE', 'PROFESOR', 'ADMINISTRATIVO']
    },
    {
      label: 'Historial fotos',
      route: '/photo-history',
      icon: 'assets/icons/historial-3.png',
      roles: ['ESTUDIANTE', 'PROFESOR', 'ADMINISTRATIVO']
    },

  ];

  get filteredMenuItems(): SidebarItem[] {
    return this.menuItems.filter(item =>
      item.roles.includes(this.currentRole)
    );
  }

}
