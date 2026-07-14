import { Routes } from '@angular/router';
import { isLoggedGuard } from './core/guards/is-logged/is-logged.guard';

export const ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./ui/views/authentication/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./ui/views/layout/main-layout').then(m => m.MainLayout),
    canActivate: [isLoggedGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./ui/views/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'operacoes',
        loadComponent: () => import('./ui/views/operations/operations').then(m => m.Operations)
      },
      {
        path: 'inclusoes-em-massa',
        loadComponent: () => import('./ui/views/mass-inclusion/mass-inclusion').then(m => m.MassInclusion)
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
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
