import { isDemo } from "@/lib/env";
import { localBackend } from "@/lib/data/local";
import { supabaseBackend } from "@/lib/data/supabase";
import type { DataBackend } from "@/lib/data/types";

/** The one data entry point. Screens never know which backend is active. */
export const data: DataBackend = isDemo() ? localBackend : supabaseBackend;

export type { DataBackend };
