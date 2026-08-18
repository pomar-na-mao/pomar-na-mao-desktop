import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  CreateZoneWithRegionsPayload,
  CreateZoneWithRegionsResult,
  Zone,
} from '../../../domain/models/zone.model';
import { ZonesService } from '../../services/zones/zones-service';

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

  public async createWithRegions(
    payload: CreateZoneWithRegionsPayload,
  ): Promise<{
    data: CreateZoneWithRegionsResult | null;
    error: PostgrestError | null;
    message: string | null;
  }> {
    const { data, error } = await this.zonesService.createWithRegions(payload);

    if (error) {
      return {
        data: null,
        error,
        message: this.toCreateZoneMessage(error),
      };
    }

    return { data: data ?? null, error: null, message: null };
  }

  private sortZones(zones: Zone[]): Zone[] {
    return [...zones].sort((left, right) =>
      left.name.localeCompare(right.name, 'pt-BR'),
    );
  }

  private toCreateZoneMessage(error: PostgrestError): string {
    const message = error.message.toLowerCase();

    if (message.includes('mais de uma zona usa este codigo')) {
      return 'Mais de uma zona usa este codigo. Corrija as zonas existentes antes de salvar.';
    }

    if (error.code === '23505' || message.includes('existe uma zona')) {
      return 'Ja existe uma zona com este nome.';
    }

    if (
      error.code === '22023' ||
      message.includes('poligono') ||
      message.includes('vertices')
    ) {
      return 'Poligono invalido. Revise o desenho e tente novamente.';
    }

    if (error.code === '42501' || message.includes('autenticado')) {
      return 'Sessao expirada ou sem permissao para criar zona.';
    }

    return 'Erro ao salvar a zona no Supabase.';
  }
}
