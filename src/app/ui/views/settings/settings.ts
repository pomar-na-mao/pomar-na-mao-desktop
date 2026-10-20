import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { LayoutService } from '../../../data/services/shared/layout';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TabsModule,
    AvatarModule,
    TagModule,
    PasswordModule,
    ToggleSwitchModule,
    DividerModule,
    TooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './settings.html',
})
export class Settings {
  public usersRepository = inject(UsersRepository);
  public layoutService = inject(LayoutService);

  activeTab = 'perfil';

  // Security form fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  twoFactorEnabled = false;

  // Notification switches
  pestAlerts = true;
  sprayingAlerts = true;
  weeklyReports = false;

  toggleDarkMode(): void {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
