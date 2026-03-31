import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InspectRoutinesViewModel } from '../../view-models/inspect-routine/inspect-routines.view-model';
import { InspectAnnotationsViewModel } from '../../view-models/inspect-annotation/inspect-annotations.view-model';
import { InspectRoutinesTableComponent } from '../../components/syncs/inspect-routines-table/inspect-routines-table';
import { InspectAnnotationsTableComponent } from '../../components/syncs/inspect-annotations-table/inspect-annotations-table';


@Component({
  selector: 'app-syncs',
  imports: [CommonModule, TranslateModule, InspectRoutinesTableComponent, InspectAnnotationsTableComponent],
  templateUrl: './syncs.html',
  styleUrls: ['./syncs.scss'],
})
export class Syncs implements OnInit {
  public inspectRoutinesViewModel = inject(InspectRoutinesViewModel);
  public inspectAnnotationsViewModel = inject(InspectAnnotationsViewModel);

  public ngOnInit(): void {
    this.inspectRoutinesViewModel.loadRoutines();
    this.inspectAnnotationsViewModel.loadAnnotations();
  }
}
