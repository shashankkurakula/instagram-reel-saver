import React, { useState } from "react";
import { saveReel } from "../db";

const ReelForm = ({ setReels }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [collection, setCollection] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newReel = { url, title, tags: tags.split(","), collection };
    await saveReel(newReel); // Save to IndexedDB
    setReels((prev) => [...prev, newReel]); // Update local state
    setUrl("");
    setTitle("");
    setTags("");
    setCollection("");
  };

  return (
    <form className="reel-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Instagram Reel URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="text"
        placeholder="Collection"
        value={collection}
        onChange={(e) => setCollection(e.target.value)}
      />
      <button type="submit">Save Reel</button>
    </form>
  );
};

export default ReelForm;