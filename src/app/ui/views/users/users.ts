import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../../shared/components/input/input';
import { ButtonDirective } from '../../../shared/directives/button/button.directive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string;
}

@Component({
  selector: 'app-users',
  imports: [CommonModule, Input, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './users.html',
})
export class Users {
  users: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrador',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao.silva@example.com',
      role: 'Editor',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Joao+Silva&background=10b981&color=fff',
    },
    {
      id: 3,
      name: 'Maria Souza',
      email: 'maria.souza@example.com',
      role: 'Visualizador',
      status: 'Inativo',
      avatar:
        'https://ui-avatars.com/api/?name=Maria+Souza&background=f59e0b&color=fff',
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      email: 'carlos.o@example.com',
      role: 'Editor',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=3b82f6&color=fff',
    },
    {
      id: 5,
      name: 'Ana Paula',
      email: 'ana.paula@example.com',
      role: 'Administrador',
      status: 'Pendente',
      avatar:
        'https://ui-avatars.com/api/?name=Ana+Paula&background=ec4899&color=fff',
    },
  ];

  getRoleStatus(role: string) {
    switch (role) {
      case 'Administrador':
        return 'primary';
      case 'Editor':
        return 'info';
      case 'Visualizador':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  getStatusTone(status: string) {
    switch (status) {
      case 'Ativo':
        return 'primary';
      case 'Inativo':
        return 'neutral';
      case 'Pendente':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
