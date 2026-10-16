import { Component, signal, ChangeDetectionStrategy, HostListener, ViewChild } from '@angular/core';
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
  @ViewChild(Header) header?: Header;
  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal(false);

  toggleSidebar(): void {
    if (window.matchMedia('(max-width: 767px)').matches) {
      this.isMobileSidebarOpen.update((value) => !value);
      return;
    }
    this.isSidebarCollapsed.update((value) => !value);
  }

  closeMobileSidebar(restoreFocus = false): void {
    const wasOpen = this.isMobileSidebarOpen();
    this.isMobileSidebarOpen.set(false);
    if (restoreFocus && wasOpen) {
      queueMicrotask(() => this.header?.focusNavigationToggle());
    }
  }

  @HostListener('document:keydown.escape')
  closeNavigationOnEscape(): void {
    this.closeMobileSidebar(true);
  }
}
