import { Injectable, signal } from "@angular/core";

export interface MassInclusionCoordinate {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class MassInclusionRepository {
  private _selectedPolygonCoordinates = signal<MassInclusionCoordinate[]>([]);
  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();

  public savePolygonCoordinates(coordinates: MassInclusionCoordinate[]): void {
    this._selectedPolygonCoordinates.set(
      coordinates.map((coordinate) => ({
        lat: coordinate.lat,
        lng: coordinate.lng,
      }))
    );
  }

  public clearPolygonCoordinates(): void {
    this._selectedPolygonCoordinates.set([]);
  }
}
