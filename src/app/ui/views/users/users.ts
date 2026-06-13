import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../../shared/components/input/input';

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
  imports: [CommonModule, Input],
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

  getRoleClass(role: string) {
    switch (role) {
      case 'Administrador':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10';
      case 'Editor':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10';
      case 'Visualizador':
        return 'text-slate-600 bg-slate-50 dark:text-slate-300 dark:bg-slate-500/10';
      default:
        return 'text-slate-600 bg-slate-50 dark:text-slate-300 dark:bg-slate-500/10';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Ativo':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Inativo':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Pendente':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  }
}
