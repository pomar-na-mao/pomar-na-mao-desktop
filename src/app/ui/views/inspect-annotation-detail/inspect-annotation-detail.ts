import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { InspectAnnotationOccurrences } from './inspect-annotation-occurrences/inspect-annotation-occurrences';
import { InspectAnnotationCurrentPointMap } from './inspect-annotation-current-point-map/inspect-annotation-current-point-map';

@Component({
  selector: 'app-inspect-annotation-detail',
  imports: [CommonModule, InspectAnnotationOccurrences, InspectAnnotationCurrentPointMap],
  templateUrl: './inspect-annotation-detail.html',
  styleUrls: ['./inspect-annotation-detail.scss'],
})
export class InspectAnnotationDetail implements OnInit {
  private route = inject(ActivatedRoute);

  public id: string | null = null;

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
