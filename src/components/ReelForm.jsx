import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { TextField, Button, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const ReelForm = ({ setReels, closeModal }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase.from("collections").select("*");
      if (!error) setCollections(data);
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.from("tags").select("*");
      if (!error) setTags(data);
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

    const { data, error } = await supabase
      .from("reels")
      .insert([{ url, title, collection_id: selectedCollection, user_id: userData.user.id }])
      .select("id")
      .single();

    if (error) {
      console.error("Error saving reel:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setReels((prev) => [...prev, data]);
    closeModal();
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField label="Instagram Reel URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

      <FormControl>
        <InputLabel>Collection</InputLabel>
        <Select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
          {collections.map((col) => (
            <MenuItem key={col.id} value={col.id}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? "Saving..." : "Save Reel"}
      </Button>
    </Box>
  );
};

export default ReelForm;
