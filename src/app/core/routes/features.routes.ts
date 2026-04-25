/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Routes } from '@angular/router';
import { Home } from '../../ui/views/home/home';
import { Syncs } from '../../ui/views/syncs/syncs';
import { InspectRoutineDetail } from '../../ui/views/inspect-routine-detail/inspect-routine-detail';
import { RoutineDetail } from '../../ui/views/routine-detail/routine-detail';
import { InspectAnnotationDetail } from '../../ui/views/inspect-annotation-detail/inspect-annotation-detail';
import { MassInclusion } from '../../ui/views/mass-inclusion/mass-inclusion';
import { PageNotFound } from '../../shared/components';

export default [
  { path: 'home', component: Home },
  { path: 'sincronizacoes', component: Syncs },
  { path: 'sincronizacoes/rotinas-de-trabalho/:id', component: RoutineDetail },
  { path: 'sincronizacoes/rotinas-de-inspecao/:id', component: InspectRoutineDetail },
  { path: 'sincronizacoes/anotacoes-de-inspecao/:id', component: InspectAnnotationDetail },
  { path: 'inclusoes-em-massa', component: MassInclusion },
  { path: 'notfound', component: PageNotFound },
  { path: '**', redirectTo: '/notfound' },
] as Routes;
