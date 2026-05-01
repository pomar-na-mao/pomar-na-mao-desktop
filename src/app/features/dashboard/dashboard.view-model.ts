import { Injectable, signal } from '@angular/core';

@Injectable()
export class DashboardViewModel {
  // State
  public metrics = signal([
    { label: 'Colheita Total', value: '1,240 kg', change: '+12%', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Árvores Ativas', value: '458', change: '0%', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Vendas Mês', value: 'R$ 12.450', change: '+8.4%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1m3.5-9a3.35 3.35 0 100 6.7M8.5 16a3.35 3.35 0 100-6.7' },
    { label: 'Alertas', value: '3', change: '-2', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
  ]);

  public recentActivities = signal([
    { id: 1, text: 'Nova colheita registrada no Setor A', time: 'Há 10 minutos', type: 'success' },
    { id: 2, text: 'Tratamento preventivo iniciado no Setor C', time: 'Há 2 horas', type: 'info' },
    { id: 3, text: 'Baixa no estoque de fertilizantes', time: 'Há 5 horas', type: 'warning' },
    { id: 4, text: 'Novo usuário "João Silva" adicionado', time: 'Ontem', type: 'info' }
  ]);

  constructor() {}

  refreshData() {
    // Logic to refresh metrics
    console.log('Refreshing dashboard data...');
  }
}
