import { inject, Injectable, signal } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { SprayingOperationResponse } from '../../../domain/models/operations.model';
import { OperationsService } from '../../services/operations/operations-service';

@Injectable({
  providedIn: 'root',
})
export class OperationsRepository {
  private operationsService = inject(OperationsService);

  public sprayingOperations = signal<SprayingOperationResponse[]>([]);

  public async getSprayingOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.operationsService.getSprayingOperations(startDate, endDate, zoneId);
    
    if (!error && data) {
      this.sprayingOperations.set(data as SprayingOperationResponse[]);
    } else {
      this.sprayingOperations.set([]);
    }

    return { error };
  }
}
