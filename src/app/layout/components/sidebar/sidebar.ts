import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarItem } from '../../models/sidebar-item.model';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly menuItems: SidebarItem[] = [
    {
      label: 'Home',
      route: '/photo-upload-home',
      icon: 'assets/icons/home.png'
    }
  ];
}
