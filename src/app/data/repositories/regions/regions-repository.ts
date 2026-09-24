import { inject, Injectable, signal } from "@angular/core";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Region } from "../../../domain/models/regions.model";
import { RegionsService } from "../../services/regions/regions-service";

@Injectable({
  providedIn: 'root',
})
export class RegionsRepository {
  private regionsService = inject(RegionsService);

  public regions = signal<Region[]>([]);
  public currentRegion = signal<Region | null>(null);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.regionsService.findAll();
    if (!error && data) {
      this.regions.set(this.sortRegions(data));
    }

    return { error };
  }

  public async findByZoneId(zoneId: string): Promise<{ data: Region[]; error: PostgrestError | null }> {
    const { data, error } = await this.regionsService.findByZoneId(zoneId);
    const sorted = data ? this.sortZoneRegions(data) : [];
    return { data: sorted, error };
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

  public sortZoneRegions(regions: Region[]): Region[] {
    return [...regions].sort((a, b) => {
      return this.compareRegionsByOrder(a, b);
    });
  }

  private sortRegions(regions: Region[]): Region[] {
    return [...regions].sort((left, right) => {
      if (left.zone_id === right.zone_id) {
        const orderComparison = this.compareRegionsByOrder(left, right);
        if (orderComparison !== 0) return orderComparison;
      }

      const regionComparison = left.region.localeCompare(right.region, 'pt-BR');
      if (regionComparison !== 0) return regionComparison;

      if (left.latitude !== right.latitude) {
        return left.latitude - right.latitude;
      }

      return left.longitude - right.longitude;
    });
  }

  private compareRegionsByOrder(left: Region, right: Region): number {
    const leftOrder = this.toFiniteOrder(left.order);
    const rightOrder = this.toFiniteOrder(right.order);
    const leftHasOrder = Number.isFinite(leftOrder);
    const rightHasOrder = Number.isFinite(rightOrder);

    if (leftHasOrder && rightHasOrder) {
      return leftOrder - rightOrder;
    }

    if (leftHasOrder) return -1;
    if (rightHasOrder) return 1;
    return 0;
  }

  private toFiniteOrder(value: number | null | undefined): number {
    if (value == null) {
      return Number.NaN;
    }

    return Number(value);
  }
}
