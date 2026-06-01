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
        path: 'home',
        loadComponent: () => import('./ui/views/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'inclusoes-em-massa',
        loadComponent: () => import('./ui/views/mass-inclusion/mass-inclusion').then(m => m.MassInclusion)
      },
      {
        path: 'settings',
        loadComponent: () => import('./ui/views/settings/settings').then(m => m.Settings)
      },
      {
        path: 'users',
        loadComponent: () => import('./ui/views/users/users').then(m => m.Users)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
