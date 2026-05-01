import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <header
      class="fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-slate-200 shadow-sm z-30 flex items-center justify-between px-4"
    >
      <div class="flex items-center gap-4">
        <button
          (click)="sidebarToggled.emit()"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <img
            src="assets/images/logo.png"
            alt="Logo"
            class="w-10 h-10 object-contain drop-shadow-sm"
          />
          <span class="font-bold text-xl tracking-tight hidden sm:block">Pomar na mão</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Notifications -->
        <button class="p-2 hover:bg-slate-100 rounded-lg relative transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-slate-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"
          ></span>
        </button>

        <!-- User Profile -->
        <div class="relative">
          <button
            (click)="toggleUserDropdown()"
            class="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
          >
            @if (currentUser()) {
              <div class="hidden text-right lg:block">
                <p class="text-xs font-semibold text-slate-900 leading-tight">
                  {{ currentUser()?.name }}
                </p>
                <p class="text-[10px] text-slate-500">{{ currentUser()?.role }}</p>
              </div>
            }
            <img
              [src]="currentUser()?.avatar"
              alt="User Avatar"
              class="w-8 h-8 rounded-lg shadow-sm"
            />
          </button>

          <!-- Dropdown Menu -->
          @if (isUserDropdownOpen()) {
            <div
              (mouseleave)="isUserDropdownOpen.set(false)"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <a
                href="#"
                class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Meu Perfil
              </a>
              <div class="h-px bg-slate-100 my-1"></div>
              <button
                (click)="logout()"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class Header {
  @Output() sidebarToggled = new EventEmitter<void>();

  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  isUserDropdownOpen = signal(false);

  toggleUserDropdown() {
    this.isUserDropdownOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
