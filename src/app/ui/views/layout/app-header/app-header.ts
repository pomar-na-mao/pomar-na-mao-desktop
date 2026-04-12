import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UsersRepository } from '../../../../data/repositories/users/users-repository';
import { LanguageSelector } from '../../../../shared/components/language-selector/language-selector';

import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule, LanguageSelector],
  templateUrl: './app-header.html',
  styleUrls: ['./app-header.scss'],
})
export class AppHeader {
  public usersRepository = inject(UsersRepository);
  public themeService = inject(ThemeService);
}
