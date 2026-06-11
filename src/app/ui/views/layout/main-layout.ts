import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, Header, Sidebar],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './main-layout.html',
})
export class MainLayout {
  isSidebarCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update((v) => !v);
  }
}
