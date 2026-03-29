/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Routes } from '@angular/router';
import { Home } from '../../ui/views/home/home';
import { Syncs } from '../../ui/views/syncs/syncs';
import { InspectRoutineDetail } from '../../ui/views/inspect-routine-detail/inspect-routine-detail';
import { PageNotFound } from '../../shared/components';

export default [
  { path: 'home', component: Home },
  { path: 'sincronizacoes', component: Syncs },
  { path: 'sincronizacoes/rotinas-de-inspecao/:id', component: InspectRoutineDetail },
  { path: 'notfound', component: PageNotFound },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
