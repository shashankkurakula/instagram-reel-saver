import React from "react";
import ReelCard from "./ReelCard";

const ReelList = ({ reels, searchQuery, setReels }) => {
  const filteredReels = reels.filter(
    (reel) =>
      reel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="reel-list">
      {filteredReels.length === 0 ? (
        <p>No reels found.</p>
      ) : (
        filteredReels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} setReels={setReels} />
        ))
      )}
    </div>
  );
};

export default ReelList;