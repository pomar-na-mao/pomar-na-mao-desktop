import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InspectRoutinesViewModel } from '../../view-models/inspect-routine/inspect-routines.view-model';
import { InspectRoutinesTableComponent } from './inspect-routines-table/inspect-routines-table';


@Component({
  selector: 'app-syncs',
  imports: [CommonModule, TranslateModule, InspectRoutinesTableComponent],
  templateUrl: './syncs.html',
  styleUrls: ['./syncs.scss'],
})
export class Syncs implements OnInit {
  public inspectRoutinesViewModel = inject(InspectRoutinesViewModel);

  public ngOnInit(): void {
    this.inspectRoutinesViewModel.loadRoutines();
  }
}
