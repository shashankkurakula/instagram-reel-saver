import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const ReelList = ({ reels, setReels }) => {  // ✅ Ensure setReels is received from parent
  const [loading, setLoading] = useState(true);

  const fetchReels = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user?.id) return;

    // Fetch reels with related collections
    const { data: reelsData, error: reelsError } = await supabase
      .from("reels")
      .select("*, collections(name)")
      .eq("user_id", user.id);

    if (reelsError) {
      console.error("Error fetching reels:", reelsError);
      setLoading(false);
      return;
    }

    // Fetch tags for all reels
    const { data: reelTags, error: reelTagsError } = await supabase
      .from("reel_tags")
      .select("reel_id, tags(id, name)");

    if (reelTagsError) {
      console.error("Error fetching tags:", reelTagsError);
    }

    // Group tags by reel ID
    const tagsByReel = {};
    if (reelTags) {
      reelTags.forEach(({ reel_id, tags }) => {
        if (!tagsByReel[reel_id]) tagsByReel[reel_id] = [];
        tagsByReel[reel_id].push(tags.name);
      });
    }

    // Merge tags into reels
    const reelsWithTags = reelsData.map((reel) => ({
      ...reel,
      tags: tagsByReel[reel.id] || [], // Ensure tags is always an array
    }));

    setReels(reelsWithTags);
    setLoading(false);
  };

  useEffect(() => {
    fetchReels(); // Fetch reels initially

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("reels")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reels" }, (payload) => {
        console.log("New reel detected:", payload.new);
        setReels((prevReels) => [payload.new, ...prevReels]); // ✅ Update UI instantly
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="reel-list">
      {loading ? (
        <p>Loading reels...</p>
      ) : reels.length === 0 ? (
        <p>No reels found.</p>
      ) : (
        reels.map((reel) => (
          <div key={reel.id} className="reel-card">
            <iframe
              src={`https://www.instagram.com/reel/${reel.url.split("/reel/")[1].split("/")[0]}/embed`}
              title={reel.title}
              width="100%"
              height="150"
              frameBorder="0"
              scrolling="no"
            ></iframe>
            <h3>{reel.title}</h3>
            <p>Collection: {reel.collections?.name || "None"}</p>
            <p>Tags: {Array.isArray(reel.tags) && reel.tags.length > 0 ? reel.tags.join(", ") : "No Tags"}</p> 
          </div>
        ))
      )}
    </div>
  );
  
};

export default ReelList;
