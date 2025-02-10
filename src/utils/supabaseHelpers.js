import { supabase } from "../config/supabase";

// ✅ Fetch all reels with collections & tags
export const fetchReels = async () => {
  const { data, error } = await supabase
    .from("reels")
    .select("*, collections(name), reel_tags(tag_id, tags(name))");

  if (error) {
    console.error("Error fetching reels:", error);
    return [];
  }

  // ✅ Format reels to include tags as an array
  return data.map((reel) => ({
    ...reel,
    tags: reel.reel_tags ? reel.reel_tags.map((tag) => tag.tags?.name) : [],
  }));
};

// ✅ Ensure tags exist, return their IDs
export const getOrCreateTags = async (tagNames, userId) => {
  let tagIds = [];

  for (const tagName of tagNames) {
    // 🔹 Check if tag already exists
    let { data: existingTag } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagName.trim().toLowerCase()) // 🔹 Ensure case-insensitive matching
      .eq("user_id", userId)
      .single();

    if (!existingTag) {
      // 🔹 Insert new tag if not found
      const { data: newTag, error } = await supabase
        .from("tags")
        .insert([{ name: tagName.trim().toLowerCase(), user_id: userId }])
        .select("id")
        .single();

      if (error) {
        console.error(`Error inserting tag: ${tagName}`, error);
        continue;
      }
      existingTag = newTag;
    }

    tagIds.push(existingTag.id);
  }

  return tagIds;
};

// ✅ Insert a new reel and associate it with multiple tags
export const insertReelWithTags = async (reel, tagNames) => {
  const { data: newReel, error: reelError } = await supabase
    .from("reels")
    .insert([reel])
    .select("id")
    .single();

  if (reelError) {
    console.error("Error inserting reel:", reelError);
    throw reelError;
  }

  const tagIds = await getOrCreateTags(tagNames, reel.user_id);

  for (const tagId of tagIds) {
    await supabase.from("reel_tags").insert([{ reel_id: newReel.id, tag_id: tagId }]);
  }

  return newReel;
};

// ✅ Fetch a single reel after inserting (to get full data with tags)
export const fetchSingleReel = async (reelId) => {
  const { data, error } = await supabase
    .from("reels")
    .select("*, collections(name), reel_tags(tag_id, tags(name))")
    .eq("id", reelId)
    .single();

  if (error) {
    console.error("Error fetching single reel:", error);
    return null;
  }

  return {
    ...data,
    tags: data.reel_tags ? data.reel_tags.map((tag) => tag.tags?.name) : [],
  };
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

// ✅ Fetch tags for the logged-in user
export const fetchTags = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return [];

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userData.user.id);

  if (error) {
    console.error("Error fetching tags:", error);
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

// ✅ Save a new reel with multiple tags
export const saveReel = async (reel, tagNames) => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error("User not logged in");

  return await insertReelWithTags({ ...reel, user_id: userData.user.id }, tagNames);
};
