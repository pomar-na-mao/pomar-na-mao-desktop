import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AnnotationOccurrences } from '../../components/annotation-detail/annotation-occurrences/annotation-occurrences';
import { AnnotationCurrentPointMap } from '../../components/annotation-detail/annotation-current-point-map/annotation-current-point-map';

@Component({
  selector: 'app-annotation-detail',
  imports: [CommonModule, AnnotationOccurrences, AnnotationCurrentPointMap],
  templateUrl: './annotation-detail.html',
  styleUrls: ['./annotation-detail.scss'],
})
export class AnnotationDetail implements OnInit {
  private route = inject(ActivatedRoute);

  @Input() public id: string | null = null;

  public ngOnInit(): void {
    if (!this.id) {
      this.id = this.route.snapshot.paramMap.get('id');
    }
  }
}
