import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../../shared/components/input/input';
import { UsersRepository } from '../../../data/repositories/users/users-repository';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, Input],
  templateUrl: './settings.html',
})
export class Settings {
  public usersRepository = inject(UsersRepository);
  activeTab = 'perfil';

  tabs = [
    { id: 'perfil', label: 'Perfil' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'notificacoes', label: 'Notificações' },
    { id: 'assinatura', label: 'Assinatura' },
  ];

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }
}
