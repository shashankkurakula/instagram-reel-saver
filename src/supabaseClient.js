import { createClient } from '@supabase/supabase-js';       

const supabaseUrl = 'https://foxvnthwsbizosttdwvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveHZudGh3c2Jpem9zdHRkd3ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNzAxNTYsImV4cCI6MjA1NDY0NjE1Nn0.VL20RO81l4tW9POuKI4GztwZSUPzj5HSztT8ZC36HUI';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch collections for the logged-in user
export const fetchCollections = async () => {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id);
  if (error) throw error;
  return data;
};

// Create a new collection
export const createCollection = async (name) => {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('collections')
    .insert([{ user_id: user.id, name }]);
  if (error) throw error;
  return data[0];
};

// Save a new reel
export const saveReel = async (reel) => {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('reels')
    .insert([{ ...reel, user_id: user.id }]);
  if (error) throw error;
  return data[0];
};