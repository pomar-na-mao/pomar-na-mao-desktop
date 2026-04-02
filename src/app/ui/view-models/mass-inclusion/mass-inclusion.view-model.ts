import { Injectable, inject } from "@angular/core";
import { MassInclusionRepository } from "../../../data/repositories/mass-inclusion/mass-inclusion.repository";
import type { PolygonCoordinate, PolygonSelection } from "../../components/mass-inclusion/map-polygon-selector";

@Injectable()
export class MassInclusionViewModel {
  private massInclusionRepository = inject(MassInclusionRepository);

  public selectedPolygonCoordinates = this.massInclusionRepository.selectedPolygonCoordinates;

  public onPolygonSelected(selection: PolygonSelection): void {
    if (!this.isValidPolygon(selection.coordinates)) {
      return;
    }

    this.massInclusionRepository.savePolygonCoordinates(selection.coordinates);
  }

  public onPolygonCleared(): void {
    this.massInclusionRepository.clearPolygonCoordinates();
  }

  private isValidPolygon(coordinates: PolygonCoordinate[]): boolean {
    if (coordinates.length < 3) {
      return false;
    }

    return coordinates.every((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
  }
}
