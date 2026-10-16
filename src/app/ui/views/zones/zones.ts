import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ZoneAssignment } from '../zone-assignment/zone-assignment';
import { ZoneMapManagement } from '../zone-map-management/zone-map-management';

export type ZoneTab = 'cadastro' | 'atribuicao';

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [CommonModule, ZoneMapManagement, ZoneAssignment],
  templateUrl: './zones.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Zones implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private queryParamSub?: Subscription;

  public activeTab = signal<ZoneTab>('cadastro');

  @ViewChild('managementView') public managementView?: ZoneMapManagement;
  @ViewChild('assignmentView') public assignmentView?: ZoneAssignment;

  public ngOnInit(): void {
    const initialTab = this.route.snapshot.queryParamMap.get('aba');
    if (initialTab === 'atribuicao' || initialTab === 'cadastro') {
      this.activeTab.set(initialTab);
    }

    this.queryParamSub = this.route.queryParamMap.subscribe((params) => {
      const tabParam = params.get('aba');
      if (tabParam === 'atribuicao' || tabParam === 'cadastro') {
        if (this.activeTab() !== tabParam) {
          this.activeTab.set(tabParam);
          this.triggerMapResize(tabParam);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }

  public setActiveTab(tab: ZoneTab): void {
    if (this.activeTab() === tab) {
      return;
    }

    this.activeTab.set(tab);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { aba: tab },
      queryParamsHandling: 'merge',
    });

    this.triggerMapResize(tab);
  }

  public triggerMapResize(tab: ZoneTab): void {
    setTimeout(() => {
      if (tab === 'cadastro') {
        this.managementView?.mapSelector?.invalidateSize();
      } else {
        this.assignmentView?.mapSelector?.invalidateSize();
      }
    }, 50);
  }
}
