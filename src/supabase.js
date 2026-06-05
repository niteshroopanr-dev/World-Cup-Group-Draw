// src/supabase.js — Supabase client for the SHARED half of the store (group data).
// Only the URL and the anon/public key live in the browser bundle; they are guarded by RLS
// (open policies + the random 10-char group code is the access barrier). Every other key is a
// server secret and must never reach here.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (url && key) ? createClient(url, key) : null;
