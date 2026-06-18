import { inject, Injectable, signal } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { SprayingOperationResponse, InspectionOperationResponse } from '../../../domain/models/operations.model';
import { OperationsService } from '../../services/operations/operations-service';

@Injectable({
  providedIn: 'root',
})
export class OperationsRepository {
  private operationsService = inject(OperationsService);

  public sprayingOperations = signal<SprayingOperationResponse[]>([]);
  public inspectionOperations = signal<InspectionOperationResponse[]>([]);
  public annotationOperations = signal<InspectionOperationResponse[]>([]);

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

  public async getInspectionOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.operationsService.getInspectionOperations(startDate, endDate, zoneId);
    
    if (!error && data) {
      this.inspectionOperations.set(data as InspectionOperationResponse[]);
    } else {
      this.inspectionOperations.set([]);
    }

    return { error };
  }

  public async getAnnotationOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.operationsService.getAnnotationOperations(startDate, endDate, zoneId);
    
    if (!error && data) {
      this.annotationOperations.set(data as InspectionOperationResponse[]);
    } else {
      this.annotationOperations.set([]);
    }

    return { error };
  }
}
