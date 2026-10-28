import { Routes } from '@angular/router';
import { isLoggedGuard } from './core/guards/is-logged/is-logged.guard';

export const ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./ui/views/authentication/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./ui/views/layout/layout').then(m => m.AppLayoutComponent),
    canActivate: [isLoggedGuard],
    children: [
      {
        path: 'visao-geral',
        loadComponent: () => import('./ui/views/overview/overview').then(m => m.Overview)
      },
      {
        path: 'cadastro',
        loadComponent: () => import('./ui/views/orchard/orchard').then(m => m.Orchard),
        children: [
          {
            path: '',
            loadChildren: () => import('./ui/views/orchard/orchard.routes')
          }
        ]
      },
      {
        path: 'inicio',
        redirectTo: 'visao-geral',
      },
      {
        path: 'atividades-de-campo',
        loadComponent: () => import('./ui/views/completed-operations/completed-operations').then(m => m.CompletedOperations)
      },
      {
        path: 'visao-das-operacoes',
        children: [
          {
            path: '',
            redirectTo: 'operacoes',
            pathMatch: 'full'
          },
          {
            path: 'operacoes',
            loadComponent: () => import('./ui/views/operations/operations').then(m => m.Operations)
          },
          {
            path: 'mipd',
            loadComponent: () => import('./ui/views/mipd/mipd').then(m => m.Mipd)
          }
        ]
      },
      {
        path: 'dados-basicos',
        loadComponent: () => import('./ui/views/basic-data/basic-data').then(m => m.BasicData)
      },
      {
        path: 'zoneamento',
        loadComponent: () => import('./ui/views/zone-assignment/zone-assignment').then(m => m.ZoneAssignment)
      },
      {
        path: 'atribuicao-zonas',
        redirectTo: 'zoneamento'
      },
      {
        path: 'configuracoes',
        loadComponent: () => import('./ui/views/settings/settings').then(m => m.Settings)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./ui/views/users/users').then(m => m.Users)
      },
      {
        path: '',
        redirectTo: 'visao-geral',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
