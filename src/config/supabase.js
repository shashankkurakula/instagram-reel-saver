import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://foxvnthwsbizosttdwvf.supabase.co";  // 🔹 Replace with your actual Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHZudGh3c2Jpem9zdHRkd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNzAxNTYsImV4cCI6MjA1NDY0NjE1Nn0.VL20RO81l4tW9POuKI4GztwZSUPzj5HSztT8ZC36HUI";  // 🔹 Replace with your actual Supabase key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
