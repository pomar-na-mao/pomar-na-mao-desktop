import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputComponent } from '../../shared/components/input/input.component';

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
  standalone: true,
  imports: [CommonModule, InputComponent],
  templateUrl: './users.component.html',
})
export class UsersComponent {
  users: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Administrador', status: 'Ativo', avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff' },
    { id: 2, name: 'João Silva', email: 'joao.silva@example.com', role: 'Editor', status: 'Ativo', avatar: 'https://ui-avatars.com/api/?name=Joao+Silva&background=10b981&color=fff' },
    { id: 3, name: 'Maria Souza', email: 'maria.souza@example.com', role: 'Visualizador', status: 'Inativo', avatar: 'https://ui-avatars.com/api/?name=Maria+Souza&background=f59e0b&color=fff' },
    { id: 4, name: 'Carlos Oliveira', email: 'carlos.o@example.com', role: 'Editor', status: 'Ativo', avatar: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=3b82f6&color=fff' },
    { id: 5, name: 'Ana Paula', email: 'ana.paula@example.com', role: 'Administrador', status: 'Pendente', avatar: 'https://ui-avatars.com/api/?name=Ana+Paula&background=ec4899&color=fff' },
  ];

  getRoleClass(role: string) {
    switch (role) {
      case 'Administrador': return 'text-emerald-600 bg-emerald-50';
      case 'Editor': return 'text-blue-600 bg-blue-50';
      case 'Visualizador': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'Ativo': return 'bg-emerald-100 text-emerald-700';
      case 'Inativo': return 'bg-slate-100 text-slate-700';
      case 'Pendente': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
