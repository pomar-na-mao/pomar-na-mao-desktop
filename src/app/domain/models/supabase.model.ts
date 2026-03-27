import type { PostgrestError } from "@supabase/supabase-js";

export interface ISupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}
