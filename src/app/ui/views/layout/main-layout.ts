import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar, MenuItem } from './components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, Header, Sidebar],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  isSidebarCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }
}
