import { supabase } from "../config/supabase";

// ✅ Fetch all reels with collections
export const fetchReels = async () => {
  const { data, error } = await supabase
    .from("reels")
    .select("*, collections(name)");

  if (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
  return data || [];
};

// ✅ Insert a new reel
export const insertReel = async (reel) => {
  const { data, error } = await supabase
    .from("reels")
    .insert([reel])
    .select("id, url")
    .single();

  if (error) {
    console.error("Error inserting reel:", error);
    throw error;
  }
  return data;
};

// ✅ Fetch a single reel after inserting (to get full data)
export const fetchSingleReel = async (reelId) => {
  const { data, error } = await supabase
    .from("reels")
    .select("*, collections(name)")
    .eq("id", reelId)
    .single();

  if (error) {
    console.error("Error fetching single reel:", error);
    return null;
  }
  return data;
};

// ✅ Delete a reel (with cascading delete for `reel_tags`)
export const deleteReel = async (reelId) => {
  const { error } = await supabase.from("reels").delete().eq("id", reelId);

  if (error) {
    console.error("Error deleting reel:", error);
    throw error;
  }
};

// ✅ Insert a new collection and return its ID
export const insertCollection = async (name, userId) => {
  const { data, error } = await supabase
    .from("collections")
    .insert([{ name, user_id: userId }])
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting collection:", error);
    throw error;
  }
  return data.id;
};

// ✅ Insert a new tag and return its ID
export const insertTag = async (name, userId) => {
  const { data, error } = await supabase
    .from("tags")
    .insert([{ name, user_id: userId }])
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting tag:", error);
    throw error;
  }
  return data.id;
};

// ✅ Fetch collections for the logged-in user
export const fetchCollections = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
  return data;
};

// ✅ Create a new collection
export const createCollection = async (name) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("collections")
    .insert([{ user_id: userData.user.id, name }])
    .select("id, name")
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
  return data;
};

// ✅ Save a new reel
export const saveReel = async (reel) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("reels")
    .insert([{ ...reel, user_id: userData.user.id }])
    .select("id, url")
    .single();

  if (error) {
    console.error("Error saving reel:", error);
    throw error;
  }
  return data;
};
