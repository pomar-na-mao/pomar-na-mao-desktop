import { Injectable, signal } from "@angular/core";
import { EMPTY_MASS_INCLUSION_DATA, type MassInclusionCoordinate, type MassInclusionData } from "../../../domain/models/mass-inclusion";



@Injectable({
  providedIn: 'root',
})
export class MassInclusionRepository {
  private _selectedPolygonCoordinates = signal<MassInclusionCoordinate[]>([]);
  private _currentMassInclusionData = signal<MassInclusionData>(EMPTY_MASS_INCLUSION_DATA);

  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();
  public currentMassInclusionData = this._currentMassInclusionData.asReadonly();

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

  public saveMassInclusionData(data: MassInclusionData): void {
    this._currentMassInclusionData.set(data);
  }
}
