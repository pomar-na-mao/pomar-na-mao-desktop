import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inspect-annotation-detail',
  imports: [CommonModule],
  templateUrl: './inspect-annotation-detail.html',
  styleUrls: ['./inspect-annotation-detail.scss'],
})
export class InspectAnnotationDetail implements OnInit {
  private route = inject(ActivatedRoute);

  public id!: string;

  public ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') as string;
  }
}
