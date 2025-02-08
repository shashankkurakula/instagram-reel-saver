import React from "react";
import { deleteReel } from "../db";

const ReelCard = ({ reel, setReels }) => {
  const handleDelete = async () => {
    await deleteReel(reel.id); // Delete from IndexedDB
    setReels((prev) => prev.filter((r) => r.id !== reel.id)); // Update local state
  };

  return (
    <div className="reel-card">
      <a href={reel.url} target="_blank" rel="noopener noreferrer">
        <img src="https://via.placeholder.com/150" alt="Reel Thumbnail" />
      </a>
      <h3>{reel.title}</h3>
      <p>Tags: {reel.tags.join(", ")}</p>
      <p>Collection: {reel.collection}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ReelCard;