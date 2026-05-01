import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../../shared/components/input/input';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, Input],
  templateUrl: './settings.html',
})
export class Settings {
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
