import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, InputComponent],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
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
