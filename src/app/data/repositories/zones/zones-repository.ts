import { inject, Injectable, signal } from "@angular/core";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Zone } from "../../../domain/models/zone.model";
import { ZonesService } from "../../services/zones/zones-service";

@Injectable({
  providedIn: 'root',
})
export class ZonesRepository {
  private zonesService = inject(ZonesService);

  public zones = signal<Zone[]>([]);
  public currentZone = signal<Zone | null>(null);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.zonesService.findAll();
    if (!error && data) {
      this.zones.set(this.sortZones(data));
    }

    return { error };
  }

  public async findById(id: string): Promise<Zone | null> {
    const { data, error } = await this.zonesService.findById(id);

    if (!error && data) {
      this.currentZone.set(data);
      return data;
    }

    this.currentZone.set(null);
    return null;
  }

  private sortZones(zones: Zone[]): Zone[] {
    return [...zones].sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  }
}
