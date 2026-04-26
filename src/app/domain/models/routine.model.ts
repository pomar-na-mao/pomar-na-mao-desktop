/* eslint-disable @typescript-eslint/naming-convention */

export interface IRoutine {
  id: number;
  date: string;
  region: string | null;
  is_done: boolean | null;
  created_at: string | null;
  description: string | null;
  updated_at: string | null;
  is_review_started: boolean;
}
