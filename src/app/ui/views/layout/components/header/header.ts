import { Component, Output, EventEmitter, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRepository } from '../../../../../data/repositories/authentication/authentication-repository';
import { UsersRepository } from '../../../../../data/repositories/users/users-repository';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <header
      class="fixed top-0 left-0 right-0 h-[60px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30 flex items-center justify-between px-4 transition-colors"
    >
      <div class="flex items-center gap-4">
        <button
          (click)="sidebarToggled.emit()"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-slate-600 dark:text-slate-300"
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
          <span class="font-bold text-xl tracking-tight hidden sm:block dark:text-white">Pomar na mão</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Theme Toggle -->
        <button
          (click)="toggleTheme()"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Theme"
        >
          @if (isDarkMode()) {
            <!-- Sun Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } @else {
            <!-- Moon Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        </button>

        <!-- Notifications -->
        <!-- <button class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-slate-600 dark:text-slate-300"
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
        </button> -->

        <!-- User Profile -->
        <div class="relative">
          <button
            (click)="toggleUserDropdown()"
            class="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none"
          >
            @if (usersRepository.currentUser()) {
              <div class="hidden text-right lg:block">
                <p class="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  Olá {{''}}{{ usersRepository.currentUser()?.full_name!.split(' ')[0] }}
                </p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Bem-vindo!</p>
              </div>
            }
            @if (avatarUrl() && !avatarLoadFailed()) {
              <img
                [src]="avatarUrl()!"
                alt="User Avatar"
                class="w-8 h-8 rounded-lg shadow-sm object-cover"
                (error)="onAvatarError()"
              />
            } @else {
              <div
                class="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100 font-semibold text-xs select-none"
                aria-label="User Avatar Placeholder"
                [attr.title]="usersRepository.currentUser()?.full_name || 'Usuário'"
              >
                {{ userInitials() || 'U' }}
              </div>
            }
          </button>

          <!-- Dropdown Menu -->
          @if (isUserDropdownOpen()) {
            <div
              (mouseleave)="isUserDropdownOpen.set(false)"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <a
                href="/settings"
                class="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
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
              <div class="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
              <button
                (click)="logout()"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
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
export class Header implements OnInit {
  @Output() sidebarToggled = new EventEmitter<void>();

  private authenticationRepository = inject(AuthenticationRepository);

  public usersRepository = inject(UsersRepository);

  private router = inject(Router);

  public isUserDropdownOpen = signal(false);
  public isDarkMode = signal(false);
  public avatarLoadFailed = signal(false);

  public avatarUrl = computed(() => {
    const url = this.usersRepository.currentUser()?.avatar_url;
    const trimmed = typeof url === 'string' ? url.trim() : '';
    return trimmed.length > 0 ? trimmed : null;
  });

  public userInitials = computed(() => {
    const fullName = this.usersRepository.currentUser()?.full_name;
    const name = typeof fullName === 'string' ? fullName.trim() : '';
    if (!name) return '';

    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  });

  private resetAvatarLoadFailedOnAvatarUrlChange = effect(() => {
    this.avatarUrl();
    this.avatarLoadFailed.set(false);
  });

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.isDarkMode.set(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.isDarkMode.set(false);
    }
  }

  public toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    this.isDarkMode.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  public toggleUserDropdown() {
    this.isUserDropdownOpen.update(v => !v);
  }

  public onAvatarError() {
    this.avatarLoadFailed.set(true);
  }

  async logout() {
    const { error } = await this.authenticationRepository.signOut();
    if (!error) {
      this.router.navigate(['/login']);
    }
  }
}
