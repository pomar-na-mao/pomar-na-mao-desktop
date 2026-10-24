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
        path: 'pomar',
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
        redirectTo: 'pomar',
      },
      {
        path: 'operacoes',
        loadComponent: () => import('./ui/views/operations/operations').then(m => m.Operations)
      },
      {
        path: 'mipd',
        loadComponent: () => import('./ui/views/mipd/mipd').then(m => m.Mipd)
      },
      {
        path: 'dados-basicos',
        loadComponent: () => import('./ui/views/basic-data/basic-data').then(m => m.BasicData)
      },
      {
        path: 'zonas',
        loadComponent: () => import('./ui/views/zones/zones').then(m => m.Zones),
        children: [
          {
            path: '',
            loadChildren: () => import('./ui/views/zones/zones.routes')
          }
        ]
      },
      {
        path: 'atribuicao-zonas',
        redirectTo: 'zonas/atribuicao'
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
        redirectTo: 'pomar',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
