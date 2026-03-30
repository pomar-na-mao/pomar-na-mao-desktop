import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InspectRoutinePlantDifference } from './inspect-routine-plant-difference/inspect-routine-plant-difference';
import { InspectRoutineCurrentPlantMap } from './inspect-routine-current-plant-map/inspect-routine-current-plant-map';

@Component({
  selector: 'app-inspect-routine-detail',
  imports: [CommonModule, InspectRoutinePlantDifference, InspectRoutineCurrentPlantMap],
  templateUrl: './inspect-routine-detail.html',
  styleUrls: ['./inspect-routine-detail.scss'],
})
export class InspectRoutineDetail implements OnInit {
  private route = inject(ActivatedRoute);

  public id: number | null = null;

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = parseInt(idParam, 10);
    }
  }
}
