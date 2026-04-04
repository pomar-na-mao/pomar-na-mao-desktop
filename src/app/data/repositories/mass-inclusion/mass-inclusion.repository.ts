import { Injectable, signal } from "@angular/core";
import type { BooleanKeys } from "../../../domain/models/plant-data.model";

export interface MassInclusionCoordinate {
  lat: number;
  lng: number;
}

export interface MassInclusionDraft {
  occurrences: BooleanKeys[];
  variety: string;
  lifeOfTree: string;
  plantingDate: string;
  description: string;
}

const EMPTY_DRAFT: MassInclusionDraft = {
  occurrences: [],
  variety: '',
  lifeOfTree: '',
  plantingDate: '',
  description: '',
};

@Injectable({
  providedIn: 'root',
})
export class MassInclusionRepository {
  private _selectedPolygonCoordinates = signal<MassInclusionCoordinate[]>([]);
  private _draft = signal<MassInclusionDraft>(EMPTY_DRAFT);

  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();
  public draft = this._draft.asReadonly();

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

  public saveDraft(draft: MassInclusionDraft): void {
    this._draft.set({
      occurrences: [...draft.occurrences],
      variety: draft.variety,
      lifeOfTree: draft.lifeOfTree,
      plantingDate: draft.plantingDate,
      description: draft.description,
    });
  }

  public clearDraft(): void {
    this._draft.set(EMPTY_DRAFT);
  }
}
