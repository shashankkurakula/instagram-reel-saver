import React from "react";

const ReelCard = ({ reel }) => {
  // Extract the Reel ID from the URL
  const reelId = reel.url.split("/reel/")[1].split("/")[0];

  return (
    <div className="reel-card">
      <iframe
        src={`https://www.instagram.com/reel/${reelId}/embed`}
        title={reel.title}
        width="100%"
        height="400"
        frameBorder="0"
        scrolling="no"
        allowTransparency="true"
      ></iframe>
      <h3>{reel.title}</h3>
      <p>Tags: {reel.tags.join(", ")}</p>
      <p>Collection: {reel.collection}</p>
    </div>
  );
};

export default ReelCard;