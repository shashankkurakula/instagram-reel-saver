import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { FaPlus } from "react-icons/fa";

const ReelForm = ({ setReels, closeModal }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollection, setNewCollection] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase.from("collections").select("*");
      if (!error) setCollections(data || []);
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.from("tags").select("*");
      if (!error) setTags(data || []);
    };

    fetchCollections();
    fetchTags();
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
    let collection_id = selectedCollection;

    // 🔹 Check if the reel already exists
    const { data: existingReel, error: checkError } = await supabase
      .from("reels")
      .select("id")
      .eq("url", url)
      .eq("user_id", userId)
      .maybeSingle(); // ✅ Prevents crashing

    if (existingReel) {
      alert("This reel is already saved.");
      setLoading(false);
      return;
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking reel:", checkError);
      alert("Error checking reel.");
      setLoading(false);
      return;
    }

    // 🔹 Insert the new reel
    const { data: insertedReel, error: insertError } = await supabase
      .from("reels")
      .insert([{ url, title, collection_id, user_id: userId }])
      .select("id, url") // ✅ Ensure URL is immediately available
      .single();

    if (insertError) {
      console.error("Error saving reel:", insertError);
      alert(insertError.message);
      setLoading(false);
      return;
    }

    // 🔹 Fetch the full reel data (including collections)
    const { data: fullReel, error: fetchError } = await supabase
      .from("reels")
      .select("id, url, title, collections(name)")
      .eq("id", insertedReel.id)
      .single();

    if (fetchError) {
      console.error("Error fetching full reel data:", fetchError);
      alert("Reel saved but could not retrieve full details.");
      setReels((prev) => [insertedReel, ...prev]); // ✅ Fallback to basic data
    } else {
      setReels((prev) => [fullReel, ...prev]); // ✅ Use full data with collections
    }

    // 🔹 Create new collection if needed
    if (newCollection.trim()) {
      const { data: newCollectionData, error: collectionError } = await supabase
        .from("collections")
        .insert([{ name: newCollection, user_id: userId }])
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

    // 🔹 Create new tag if needed
    if (newTag.trim()) {
      const { data: newTagData, error: tagError } = await supabase
        .from("tags")
        .insert([{ name: newTag, user_id: userId }])
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

    closeModal();
    setLoading(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, padding: 2 }}
    >
      <Typography variant="h6">Add New Reel</Typography>

      <TextField
        label="Instagram Reel URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Collection</InputLabel>
          <Select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            {collections.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton
          color="primary"
          onClick={() => setIsCreatingCollection(true)}
        >
          <FaPlus />
        </IconButton>
      </Box>

      {isCreatingCollection && (
        <TextField
          label="New Collection Name"
          value={newCollection}
          onChange={(e) => setNewCollection(e.target.value)}
          fullWidth
        />
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Tags</InputLabel>
          <Select
            multiple
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            renderValue={(selected) =>
              selected
                .map((id) => tags.find((tag) => tag.id === id)?.name)
                .join(", ")
            }
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton color="primary" onClick={() => setIsCreatingTag(true)}>
          <FaPlus />
        </IconButton>
      </Box>

      {isCreatingTag && (
        <TextField
          label="New Tag Name"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          fullWidth
        />
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Reel"}
        </Button>
        <Button
          onClick={closeModal}
          variant="contained"
          color="secondary"
          fullWidth
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default ReelForm;
