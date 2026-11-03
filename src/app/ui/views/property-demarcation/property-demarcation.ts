import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MapPolygonSelector } from '../../components/basic-data/map-polygon-selector/map-polygon-selector';
import { PropertyDemarcationViewModel } from '../../view-models/property-demarcation/property-demarcation.view-model';

@Component({
  selector: 'app-property-demarcation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MapPolygonSelector,
  ],
  providers: [PropertyDemarcationViewModel],
  templateUrl: './property-demarcation.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: calc(100vh - 7rem);
        min-height: 32rem;
      }
    `,
  ],
})
export class PropertyDemarcation implements OnInit {
  public readonly viewModel = inject(PropertyDemarcationViewModel);

  public ngOnInit(): void {
    void this.viewModel.loadBoundary();
  }
}

