import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../shared/components/input/input';
import { Select } from '../../shared/components/select/select';

export interface Report {
  id: number;
  name: string;
  date: string;
  type: string;
  status: string;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, Input, Select],
  templateUrl: './reports.html',
})
export class Reports {
  reports: Report[] = [
    { id: 1, name: 'Vendas Mensais', date: '30/04/2026', type: 'Financeiro', status: 'Concluído' },
    { id: 2, name: 'Inventário de Estoque', date: '28/04/2026', type: 'Operacional', status: 'Concluído' },
    { id: 3, name: 'Desempenho de Equipe', date: '25/04/2026', type: 'RH', status: 'Em processamento' },
    { id: 4, name: 'Taxa de Conversão Q1', date: '15/04/2026', type: 'Marketing', status: 'Concluído' },
    { id: 5, name: 'Auditoria Anual', date: '01/04/2026', type: 'Compliance', status: 'Falhou' },
  ];

  getStatusClass(status: string) {
    switch (status) {
      case 'Concluído': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Em processamento': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Falhou': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  }
}
