import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  MipdMarkingInput,
  MipdOperationItem,
  MipdPlantPart,
  MipdSyncPayload,
} from '../../../domain/models/mipd-operation.model';
import {
  type MipdPlantSummary,
  type MipdQueryFilters,
  MipdService,
} from '../../services/mipd/mipd.service';

@Injectable({ providedIn: 'root' })
export class MipdRepository {
  private mipdService = inject(MipdService);
  private requestId = 0;

  public operations = signal<MipdOperationItem[]>([]);
  public occurrenceTypes = signal<Array<{ id: string; name: string }>>([]);
  public zones = signal<Array<{ id: string; name: string }>>([]);
  public plants = signal<MipdPlantSummary[]>([]);
  public isLoading = signal(false);

  public async findAll(
    filters: MipdQueryFilters = {},
  ): Promise<{ error: PostgrestError | null }> {
    const currentRequestId = ++this.requestId;
    this.isLoading.set(true);

    try {
      const { data, error } = await this.mipdService.getMipdOperations(filters);

      if (currentRequestId === this.requestId) {
        if (!error && data) {
          this.operations.set(data as MipdOperationItem[]);
        } else {
          this.operations.set([]);
        }
      }

      return { error };
    } finally {
      if (currentRequestId === this.requestId) {
        this.isLoading.set(false);
      }
    }
  }

  public async loadOccurrenceTypes(): Promise<void> {
    const { data } = await this.mipdService.getPestAndDiseaseOccurrenceTypes();
    if (data) {
      this.occurrenceTypes.set(data);
    }
  }

  public async loadZones(): Promise<void> {
    const { data } = await this.mipdService.getZones();
    if (data) {
      this.zones.set(data);
    }
  }

  public async loadPlants(zoneId?: string | null): Promise<void> {
    const { data } = await this.mipdService.getPlants(zoneId);
    if (data) {
      this.plants.set(data);
    }
  }

  public async submitMarking(params: {
    plantId: string;
    occurrenceTypeId: string;
    plantParts: MipdPlantPart[];
    observedAt: string;
    photoFile?: File | null;
    deviceId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const deviceId = params.deviceId || 'desktop-web';
    const localMarkingId = crypto.randomUUID();

    let photoObjectPath: string | null = null;
    if (params.photoFile) {
      const uploadRes = await this.mipdService.uploadPhoto(
        params.photoFile,
        localMarkingId,
        deviceId,
      );
      if (uploadRes.error) {
        return {
          success: false,
          error: `Erro ao enviar foto: ${uploadRes.error.message}`,
        };
      }
      photoObjectPath = uploadRes.path;
    }

    const marking: MipdMarkingInput = {
      localMarkingId,
      plantId: params.plantId,
      occurrenceTypeId: params.occurrenceTypeId,
      plantParts: params.plantParts,
      observedAt: params.observedAt,
      photoObjectPath,
    };

    const payload: MipdSyncPayload = {
      deviceId,
      markings: [marking],
    };

    const { error } = await this.mipdService.syncMipdMarkings(payload);
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  public async getSignedPhotoUrl(photoPath: string): Promise<string | null> {
    const { signedUrl } = await this.mipdService.createSignedPhotoUrl(photoPath);
    return signedUrl;
  }
}
