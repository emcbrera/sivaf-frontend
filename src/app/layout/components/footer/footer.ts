import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  @HostBinding('class') classes: string = 'main-footer';
  public currentYear = new Date().getFullYear().toString();
}
