import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() isSidebarOpen = true;
  @Output() toggleMenuSidebar = new EventEmitter<void>();

  onToggleMenuSidebar(): void {
    this.toggleMenuSidebar.emit();
  }
}
