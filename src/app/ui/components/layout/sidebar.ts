import { Component } from '@angular/core';
import { AppMenu } from './menu';

@Component({
  selector: 'app-sidebar',
  imports: [AppMenu],
  template: `
    <div class="layout-sidebar">
      <app-menu />
    </div>
  `,
})
export class AppSidebar {}
