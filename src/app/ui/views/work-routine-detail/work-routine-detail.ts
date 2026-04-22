import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WorkRoutinePlantDifference } from '../../components/work-routine-detail/work-routine-plant-difference/work-routine-plant-difference';
import { WorkRoutineCurrentPlantMap } from '../../components/work-routine-detail/work-routine-current-plant-map/work-routine-current-plant-map';

@Component({
  selector: 'app-work-routine-detail',
  imports: [CommonModule, WorkRoutinePlantDifference, WorkRoutineCurrentPlantMap],
  templateUrl: './work-routine-detail.html',
  styleUrls: ['./work-routine-detail.scss'],
})
export class WorkRoutineDetail implements OnInit {
  private route = inject(ActivatedRoute);

  public id: number | null = null;

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = parseInt(idParam, 10);
    }
  }
}
