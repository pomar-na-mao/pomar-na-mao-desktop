import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoutinePlantDifference } from '../../components/routine-detail/routine-plant-difference/routine-plant-difference';
import { RoutineCurrentPlantMap } from '../../components/routine-detail/routine-current-plant-map/routine-current-plant-map';

@Component({
  selector: 'app-routine-detail',
  imports: [CommonModule, RoutinePlantDifference, RoutineCurrentPlantMap],
  templateUrl: './routine-detail.html',
  styleUrls: ['./routine-detail.scss'],
})
export class RoutineDetail implements OnInit {
  private route = inject(ActivatedRoute);

  @Input() public id: number | null = null;

  public ngOnInit(): void {
    if (!this.id) {
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.id = parseInt(idParam, 10);
      }
    }
  }
}
