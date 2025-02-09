import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ReelForm = ({ setReels, closeModal }) => { // ✅ Accept `closeModal` prop to close modal
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]); // ✅ Always initialized as an array
  const [newTag, setNewTag] = useState(""); // New tag input
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollection, setNewCollection] = useState(""); // New collection input
  const [loading, setLoading] = useState(false);

  // Fetch existing collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching collections:", error);
      } else {
        setCollections(data || []); // ✅ Ensure it's always an array
      }
    };

    fetchCollections();
  }, []);

  // Fetch existing tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching tags:", error);
      } else {
        setTags(data || []); // ✅ Ensure it's always an array
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData?.user) {
      alert("User not found. Please log in.");
      setLoading(false);
      return;
    }
    const user = userData.user;

    let collection_id = selectedCollection || null;

    // **🔹 Check if the reel already exists before inserting**
    const { data: existingReel, error: checkError } = await supabase
      .from("reels")
      .select("id")
      .eq("url", url)
      .eq("user_id", user.id)
      .single();

    if (existingReel) {
      alert("This reel has already been saved.");
      setLoading(false);
      return;
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing reel:", checkError);
      setLoading(false);
      return;
    }

    // If user entered a new collection, create it
    if (newCollection.trim()) {
      const { data: newCollectionData, error: collectionError } = await supabase
        .from("collections")
        .insert([{ name: newCollection, user_id: user.id }])
        .select("id")
        .single();

      if (collectionError) {
        console.error("Error creating collection:", collectionError);
        alert("Error creating collection.");
        setLoading(false);
        return;
      }
      collection_id = newCollectionData.id;
      setCollections((prev) => [...prev, newCollectionData]); // Add new collection to UI
      setNewCollection(""); // Clear input
    }

    // If user entered a new tag, create it
    let tagIds = [];
    if (newTag.trim()) {
      const { data: newTagData, error: tagError } = await supabase
        .from("tags")
        .insert([{ name: newTag, user_id: user.id }])
        .select("id")
        .single();

      if (tagError) {
        console.error("Error creating tag:", tagError);
        alert("Error creating tag.");
        setLoading(false);
        return;
      }
      tagIds.push(newTagData.id);
      setTags((prev) => [...prev, newTagData]); // Add new tag to UI
      setNewTag(""); // Clear input
    }

    // Ensure selected tags are included
    tagIds = [...tagIds, ...tags.map((tag) => tag.id)];

    // Save reel
    const { data: newReel, error: reelError } = await supabase
      .from("reels")
      .insert([{ url, title, collection_id, user_id: user.id }])
      .select("id, url, title, collection_id")
      .single();

    if (reelError) {
      console.error("Error saving reel:", reelError);
      alert(reelError.message);
      setLoading(false);
      return;
    }

    // Save tags to reel_tags table
    for (const tag_id of tagIds) {
      await supabase.from("reel_tags").insert([{ reel_id: newReel.id, tag_id }]);
    }

    setReels((prev) => [newReel, ...prev]); // ✅ Update UI instantly
    closeModal(); // ✅ Close modal automatically after saving
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Instagram Reel URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* Collection Selection */}
      <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
        <option value="">Select a Collection</option>
        {collections.map((col) => (
          <option key={col.id} value={col.id}>
            {col.name}
          </option>
        ))}
      </select>

      {/* New Collection Input */}
      <input type="text" placeholder="Or create a new collection" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} />

      {/* Tag Selection */}
      <select multiple value={tags.map((tag) => tag.id)} onChange={(e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setTags(tags.filter(tag => selectedOptions.includes(tag.id)));
      }}>
        <option value="">Select Tags</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
      </select>

      {/* New Tag Input */}
      <input type="text" placeholder="Or create a new tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} />

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Reel"}
      </button>
    </form>
  );
};

export default ReelForm;
