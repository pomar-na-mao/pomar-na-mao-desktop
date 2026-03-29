import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-inspect-routine-detail',
  imports: [CommonModule],
  templateUrl: './inspect-routine-detail.html',
  styleUrls: ['./inspect-routine-detail.scss'],
})
export class InspectRoutineDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public id: number | null = null;

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = parseInt(idParam, 10);
    }
  }

  public goBack(): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes']);
  }
}
