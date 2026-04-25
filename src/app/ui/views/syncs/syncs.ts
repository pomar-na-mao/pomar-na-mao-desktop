import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InspectRoutinesViewModel } from '../../view-models/inspect-routine/inspect-routines.view-model';
import { InspectAnnotationsViewModel } from '../../view-models/inspect-annotation/inspect-annotations.view-model';
import { NewPlantsViewModel } from '../../view-models/new-plant/new-plants.view-model';
import { InspectRoutinesTableComponent } from '../../components/syncs/inspect-routines-table/inspect-routines-table';
import { RoutinesTableComponent } from '../../components/syncs/routines-table/routines-table';
import { InspectAnnotationsTableComponent } from '../../components/syncs/inspect-annotations-table/inspect-annotations-table';
import { NewPlantsTableComponent } from '../../components/syncs/new-plants-table/new-plants-table';
import { RoutinesViewModel } from '../../view-models/routine/routines.view-model';

@Component({
  selector: 'app-syncs',
  imports: [CommonModule, TranslateModule, InspectRoutinesTableComponent, RoutinesTableComponent, InspectAnnotationsTableComponent, NewPlantsTableComponent],
  templateUrl: './syncs.html',
  styleUrls: ['./syncs.scss'],
})
export class Syncs implements OnInit {
  public routinesViewModel = inject(RoutinesViewModel);
  public inspectRoutinesViewModel = inject(InspectRoutinesViewModel);
  public inspectAnnotationsViewModel = inject(InspectAnnotationsViewModel);
  public newPlantsViewModel = inject(NewPlantsViewModel);

  public ngOnInit(): void {
    this.routinesViewModel.loadRoutines();
    this.inspectRoutinesViewModel.loadRoutines();
    this.inspectAnnotationsViewModel.loadAnnotations();
    this.newPlantsViewModel.loadNewPlants();
  }


}
