import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type { MipdMarking } from '../../../domain/models/mipd.model';
import {
  MipdService,
  type MipdSignedPhotoResult,
} from '../../services/mipd/mipd-service';

@Injectable({ providedIn: 'root' })
export class MipdRepository {
  private mipdService = inject(MipdService);
  private requestId = 0;

  public markings = signal<MipdMarking[]>([]);
  public errorMessage = signal<string | null>(null);
  public isLoading = signal(false);

  public async findMarkings(
    startDate?: string | null,
    endDate?: string | null,
    occurrenceTypeId?: string | null,
    zoneId?: string | null,
  ): Promise<{ error: PostgrestError | null }> {
    const currentRequestId = ++this.requestId;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { data, error } = await this.mipdService.getMarkings(
      startDate,
      endDate,
      occurrenceTypeId,
      zoneId,
    );

    if (currentRequestId === this.requestId) {
      this.isLoading.set(false);
      if (error) {
        this.markings.set([]);
        this.errorMessage.set(error.message);
      } else {
        this.markings.set(data ?? []);
      }
    }

    return { error };
  }

  public createSignedPhotoUrl(
    objectPath: string | null,
  ): Promise<MipdSignedPhotoResult> {
    return this.mipdService.createSignedPhotoUrl(objectPath);
  }

  public clear(): void {
    ++this.requestId;
    this.markings.set([]);
    this.errorMessage.set(null);
    this.isLoading.set(false);
  }
}
