/* eslint-disable @typescript-eslint/naming-convention */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSidebar } from './app-sidebar/app-sidebar';
import { AppHeader } from './app-header/app-header';
import { FarmOverviewMapViewModel } from '../../view-models/farm-overview-map/farm-overview-map.view-model';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    AppSidebar,
    AppHeader,
  ],
  providers: [FarmOverviewMapViewModel],
  template: `
    <app-sidebar />
    <div class="layout-wrapper">
      <app-header />
      <main class="layout-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    .layout-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      height: 100vh;
    }

    .layout-content {
      flex: 1;
      overflow-y: auto;
      background: #f8f9fb;
    }
  `],
})
export class AppLayout { }
