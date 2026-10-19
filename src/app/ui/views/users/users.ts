import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

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
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToolbarModule,
    AvatarModule,
    TooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './users.html',
})
export class Users {
  selectedUsers: User[] = [];

  users: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@pomarnamao.com',
      role: 'Administrador',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
    },
    {
      id: 2,
      name: 'João Silva',
      email: 'joao.silva@pomarnamao.com',
      role: 'Editor',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Joao+Silva&background=10b981&color=fff',
    },
    {
      id: 3,
      name: 'Maria Souza',
      email: 'maria.souza@pomarnamao.com',
      role: 'Visualizador',
      status: 'Inativo',
      avatar:
        'https://ui-avatars.com/api/?name=Maria+Souza&background=f59e0b&color=fff',
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      email: 'carlos.o@pomarnamao.com',
      role: 'Editor',
      status: 'Ativo',
      avatar:
        'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=3b82f6&color=fff',
    },
    {
      id: 5,
      name: 'Ana Paula',
      email: 'ana.paula@pomarnamao.com',
      role: 'Administrador',
      status: 'Pendente',
      avatar:
        'https://ui-avatars.com/api/?name=Ana+Paula&background=ec4899&color=fff',
    },
  ];

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (role) {
      case 'Administrador':
        return 'danger';
      case 'Editor':
        return 'info';
      case 'Visualizador':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (status) {
      case 'Ativo':
        return 'success';
      case 'Inativo':
        return 'danger';
      case 'Pendente':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  exportCSV(table: Table): void {
    table.exportCSV();
  }
}
