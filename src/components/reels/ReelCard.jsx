import React, { useState } from "react";

const ReelCard = ({ reel, setReels }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDelete = async () => {
    await deleteReel(reel.id); // Delete from IndexedDB
    setReels((prev) => prev.filter((r) => r.id !== reel.id)); // Update local state
  };

  let reelId = "";
  try {
    reelId = reel.url.split("/reel/")[1].split("/")[0];
  } catch (error) {
    console.error("Invalid Reel URL:", reel.url);
    return (
      <div className="reel-card">
        <p>Invalid Reel URL. Please check the link.</p>
      </div>
    );
  }

  return (
    <div className="reel-card">
      <div
        className="reel-iframe-container"
        style={{ backgroundColor: isPlaying ? "#000" : "transparent" }}
      >
        <iframe
          src={`https://www.instagram.com/reel/${reelId}/embed`}
          title={reel.title}
          width="100%"
          height="500"
          frameBorder="0"
          scrolling="no"
          allowTransparency="true"
          style={{ aspectRatio: "9 / 16" }}
          onLoad={() => setIsPlaying(true)} // Hide thumbnail when Reel starts playing
        ></iframe>
      </div>
      <h3>{reel.title}</h3>
      <p>Tags: {reel.tags.join(", ")}</p>
      <p>Collection: {reel.collection}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default ReelCard;