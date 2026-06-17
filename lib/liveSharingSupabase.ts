import { createClient } from "@supabase/supabase-js";

const LIVE_URL =
  process.env.EXPO_PUBLIC_LIVE_SUPABASE_URL!;

const LIVE_KEY =
  process.env.EXPO_PUBLIC_LIVE_SUPABASE_ANON_KEY!;

export const liveSharingSupabase =
  createClient(
    LIVE_URL,
    LIVE_KEY
  );

  console.log(
    "LIVE URL:",
    process.env.EXPO_PUBLIC_LIVE_SUPABASE_URL
  );
  
  console.log(
    "LIVE KEY:",
    process.env.EXPO_PUBLIC_LIVE_SUPABASE_ANON_KEY
  );