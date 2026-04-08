import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.html',
  styleUrls: ['./page-not-found.scss'],
  imports: [TranslateModule],
})
export class PageNotFound {
  public leaves = new Array(12).fill(0).map(() => ({
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 5 + 's',
    duration: Math.random() * 10 + 10 + 's',
    size: Math.random() * 20 + 20 + 'px',
    opacity: Math.random() * 0.4 + 0.1
  }));

  private router = inject(Router)

  public goToDashboard(): void {
    this.router.navigate(['/pomar-na-mao/home']);
  }
}
