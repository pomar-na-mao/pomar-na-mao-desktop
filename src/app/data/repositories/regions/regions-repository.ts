import { inject, Injectable, signal } from "@angular/core";
import type { Region } from "../../../domain/models/regions.model";
import { RegionsService } from "../../services/regions/regions-service";

@Injectable({
  providedIn: 'root',
})
export class RegionsRepository {
  private regionsService = inject(RegionsService);

  public regions = signal<Region[]>([]);
  public currentRegion = signal<Region | null>(null);

  public async findAll(): Promise<void> {
    const { data, error } = await this.regionsService.findAll();
    if (!error && data) {
      this.regions.set(data);
    }
  }

  public async findById(id: string): Promise<Region | null> {
    const { data, error } = await this.regionsService.findById(id);

    if (!error && data) {
      this.currentRegion.set(data);
      return data;
    }

    this.currentRegion.set(null);
    return null;
  }
}
