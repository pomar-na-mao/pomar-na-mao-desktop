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
        path: 'reports',
        loadComponent: () => import('./ui/views/reports/reports').then(m => m.Reports)
      },
      {
        path: 'users',
        loadComponent: () => import('./ui/views/users/users').then(m => m.Users)
      },
      {
        path: 'settings',
        loadComponent: () => import('./ui/views/settings/settings').then(m => m.Settings)
      },
      {
        path: 'sincronizacoes',
        loadComponent: () => import('./ui/views/syncs/syncs').then(m => m.Syncs)
      },
      {
        path: 'sincronizacoes/rotinas/:id',
        loadComponent: () => import('./ui/views/routine-detail/routine-detail').then(m => m.RoutineDetail)
      },
      {
        path: 'sincronizacoes/anotacoes-de-inspecao/:id',
        loadComponent: () => import('./ui/views/annotation-detail/annotation-detail').then(m => m.AnnotationDetail)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
