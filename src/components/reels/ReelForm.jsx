import React, { useState, useEffect } from "react";
import { fetchReels, insertReel, insertCollection, insertTag } from "../../utils/supabaseHelpers";
import { supabase } from "../../config/supabase";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton } from "@mui/material";
import { FaPlus } from "react-icons/fa";

const ReelForm = ({ setReels, closeModal }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [collections, setCollections] = useState([]); // ✅ Ensure it's always an array
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    const fetchCollectionsAndTags = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // ✅ Fetch Collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select("id, name")
        .eq("user_id", userData.user.id);

      if (collectionsError) {
        console.error("Error fetching collections:", collectionsError);
      } else {
        setCollections(collectionsData || []);
      }

      // ✅ Fetch Tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("tags")
        .select("id, name")
        .eq("user_id", userData.user.id);

      if (tagsError) {
        console.error("Error fetching tags:", tagsError);
      } else {
        setTags(tagsData || []);
      }
    };

    fetchCollectionsAndTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      alert("User not found. Please log in.");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;
    let collection_id = selectedCollection || null;

    if (newCollection.trim()) {
      collection_id = await insertCollection(newCollection, userId);
      setCollections((prev) => [...prev, { id: collection_id, name: newCollection }]);
      setNewCollection("");
      setIsCreatingCollection(false);
    }

    let tagIds = [...selectedTags];

    if (newTag.trim()) {
      const newTagId = await insertTag(newTag, userId);
      tagIds.push(newTagId);
      setTags((prev) => [...prev, { id: newTagId, name: newTag }]);
      setNewTag("");
      setIsCreatingTag(false);
    }

    try {
      const newReel = await insertReel({ url, title, collection_id, user_id: userId });
      const updatedReels = await fetchReels();
      setReels(updatedReels);
      closeModal();
    } catch (error) {
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 2 }}>
      <Typography variant="h6">Add New Reel</Typography>

      <TextField label="Instagram Reel URL" value={url} onChange={(e) => setUrl(e.target.value)} required fullWidth />
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />

      {/* ✅ Collection Dropdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Collection</InputLabel>
          <Select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
            {collections.length > 0 ? (
              collections.map((col) => (
                <MenuItem key={`collection-${col.id}`} value={col.id}> {/* ✅ Unique key */}
                  {col.name || "Unnamed Collection"}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled key="no-collections">No Collections Found</MenuItem>
            )}
          </Select>
        </FormControl>
        <IconButton color="primary" onClick={() => setIsCreatingCollection(true)}>
          <FaPlus />
        </IconButton>
      </Box>

      {isCreatingCollection && (
        <TextField label="New Collection Name" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} fullWidth />
      )}

      {/* ✅ Tags Dropdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Tags</InputLabel>
          <Select
            multiple
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            renderValue={(selected) =>
              selected.map((id) => tags.find((tag) => tag.id === id)?.name).join(", ")
            }
          >
            {tags.length > 0 ? (
              tags.map((tag) => (
                <MenuItem key={`tag-${tag.id}`} value={tag.id}> {/* ✅ Unique key */}
                  {tag.name || "Unnamed Tag"}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled key="no-tags">No Tags Found</MenuItem>
            )}
          </Select>
        </FormControl>
        <IconButton color="primary" onClick={() => setIsCreatingTag(true)}>
          <FaPlus />
        </IconButton>
      </Box>

      {isCreatingTag && (
        <TextField label="New Tag Name" value={newTag} onChange={(e) => setNewTag(e.target.value)} fullWidth />
      )}

      {/* ✅ Save and Close Buttons */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? "Saving..." : "Save Reel"}
        </Button>
        <Button onClick={closeModal} variant="contained" color="secondary" fullWidth>
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default ReelForm;
