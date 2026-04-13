import { Routes } from '@angular/router';
import { isLoggedGuard } from './core/guards/is-logged/is-logged.guard';
import { PageNotFound } from './shared/components';
import { AppLayout } from './ui/views/layout/layout';

export const ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./ui/views/authentication/login/login').then(c => c.Login),
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [isLoggedGuard],
    children: [{ path: 'pomar-na-mao', loadChildren: () => import('./core/routes/features.routes') }],
  },
  { path: 'notfound', component: PageNotFound },
  { path: '**', redirectTo: '/notfound' },
];
