import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationsViewModel } from '../../view-models/annotation/annotations.view-model';
import { NewPlantsViewModel } from '../../view-models/new-plant/new-plants.view-model';
import { RoutinesTableComponent } from '../../components/syncs/routines-table/routines-table';
import { AnnotationsTableComponent } from '../../components/syncs/annotations-table/annotations-table';
import { NewPlantsTableComponent } from '../../components/syncs/new-plants-table/new-plants-table';
import { RoutinesViewModel } from '../../view-models/routine/routines.view-model';

@Component({
  selector: 'app-syncs',
  imports: [CommonModule, RoutinesTableComponent, AnnotationsTableComponent, NewPlantsTableComponent],
  templateUrl: './syncs.html',
  styleUrls: ['./syncs.scss'],
})
export class Syncs implements OnInit {
  public routinesViewModel = inject(RoutinesViewModel);
  public annotationsViewModel = inject(AnnotationsViewModel);
  public newPlantsViewModel = inject(NewPlantsViewModel);

  activeTab = 'annotations';

  tabs = [
    { id: 'annotations', label: 'Anotações' },
    { id: 'new-plants', label: 'Novas Plantas' },
    { id: 'routines', label: 'Rotinas' },
  ];

  public ngOnInit(): void {
    this.routinesViewModel.loadRoutines();
    this.annotationsViewModel.loadAnnotations();
    this.newPlantsViewModel.loadNewPlants();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }


}
