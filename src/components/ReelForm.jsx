import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { FaPlus } from "react-icons/fa"; // ➕ Icon for new collection & tags

const ReelForm = ({ setReels, closeModal }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("user_id", user.id);

      if (error) console.error("Error fetching collections:", error);
      else setCollections(data || []);
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", user.id);

      if (error) console.error("Error fetching tags:", error);
      else setTags(data || []);
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

    const { data: existingReel } = await supabase
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
      setCollections((prev) => [...prev, newCollectionData]);
      setNewCollection("");
      setIsCreatingCollection(false);
    }

    let tagIds = [...selectedTags];

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
      setTags((prev) => [...prev, newTagData]);
      setNewTag("");
      setIsCreatingTag(false);
    }

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

    for (const tag_id of tagIds) {
      await supabase.from("reel_tags").insert([{ reel_id: newReel.id, tag_id }]);
    }

    setReels((prev) => [newReel, ...prev]);
    closeModal();
    setLoading(false);
  };

  return (
    <form className="reel-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Instagram Reel URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

      <div className="input-group">
        <div className="dropdown-container">
          <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
            <option value="">Collection</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
          <FaPlus className="plus-icon" onClick={() => setIsCreatingCollection(true)} />
        </div>
      </div>

      {isCreatingCollection && (
        <input type="text" placeholder="New Collection Name" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} />
      )}

      <div className="input-group">
        <div className="dropdown-container">
          <select value={selectedTags} onChange={(e) => setSelectedTags([e.target.value])}>
            <option value="">Tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <FaPlus className="plus-icon" onClick={() => setIsCreatingTag(true)} />
        </div>
      </div>

      {isCreatingTag && (
        <input type="text" placeholder="New Tag Name" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
      )}

      <div className="button-group">
        <button type="submit" disabled={loading} className="save-btn">
          {loading ? "Saving..." : "Save Reel"}
        </button>
        <button type="button" onClick={closeModal} className="close-btn">Close</button>
      </div>
    </form>
  );
};

export default ReelForm;
