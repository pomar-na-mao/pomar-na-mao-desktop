import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';
import { FieldActivitiesService } from '../../services/field-activities/field-activities.service';

@Injectable({ providedIn: 'root' })
export class FieldActivitiesRepository {
  private fieldActivitiesService = inject(FieldActivitiesService);
  private requestId = 0;

  public activities = signal<FieldActivityItem[]>([]);

  public async findAll(
    startDate?: string | null,
    endDate?: string | null,
  ): Promise<{ error: PostgrestError | null }> {
    const currentRequestId = ++this.requestId;
    const { data, error } = await this.fieldActivitiesService.getFieldActivities(
      startDate,
      endDate,
    );

    if (currentRequestId === this.requestId) {
      if (!error && data) {
        this.activities.set(data as FieldActivityItem[]);
      } else {
        this.activities.set([]);
      }
    }

    return { error };
  }
}
